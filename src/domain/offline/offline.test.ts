import { describe, expect, it } from "vitest";
import { canRetryAt, nextRetryAt, retryDelayMs } from "./backoff";
import { coachUnavailableCopy, FEATURE_CAPABILITY } from "./capability";
import { resolveConflict } from "./conflict";
import { runSyncPass } from "./engine";
import {
  connectionUiCopy,
  deriveConnectionUiKind,
  pendingCountCopy,
  recoveredSessionCopy,
} from "./labels";
import { enqueueOperation, orderOperations, pendingDataCount } from "./queue";
import type { NewSyncOperation, SyncOperation, SyncSendResult } from "./types";

function op(
  partial: Partial<NewSyncOperation> &
    Pick<NewSyncOperation, "id" | "client_mutation_id" | "entity_id">,
): NewSyncOperation {
  return {
    tipo: "SET_COMPLETED",
    entidade: "set_result",
    payload: { reps: 8, weightKg: 80 },
    occurred_at: "2026-08-26T21:00:00.000Z",
    user_id: "user-1",
    ...partial,
  };
}

describe("fila de sincronização", () => {
  it("não duplica pelo client_mutation_id", () => {
    const first = enqueueOperation(
      [],
      op({ id: "a", client_mutation_id: "m1", entity_id: "set-1" }),
    );
    const second = enqueueOperation(
      first,
      op({ id: "b", client_mutation_id: "m1", entity_id: "set-1", payload: { reps: 99 } }),
    );
    expect(second).toHaveLength(1);
    expect(second[0].payload.reps).toBe(8);
  });

  it("não envia filho antes do pai", () => {
    const session = enqueueOperation([], {
      id: "s",
      tipo: "SESSION_STARTED",
      entidade: "training_session",
      entity_id: "session-1",
      client_mutation_id: "cm-s",
      occurred_at: "2026-08-26T21:00:00.000Z",
      user_id: "user-1",
      payload: {},
    });
    const set = enqueueOperation(session, {
      id: "set",
      tipo: "SET_COMPLETED",
      entidade: "set_result",
      entity_id: "set-1",
      client_mutation_id: "cm-set",
      occurred_at: "2026-08-26T21:01:00.000Z",
      user_id: "user-1",
      payload: {},
      dependency_ids: ["s"],
    });
    expect(orderOperations(set).map((row) => row.id)).toEqual(["s", "set"]);
  });

  it("não bloqueia dados por upload de arquivo", () => {
    const file = enqueueOperation([], {
      id: "f",
      tipo: "PHOTO_UPLOAD",
      entidade: "file_upload",
      entity_id: "photo-1",
      client_mutation_id: "cm-f",
      occurred_at: "2026-08-26T21:00:00.000Z",
      user_id: "user-1",
      payload: {},
      lane: "FILE",
    });
    const set = enqueueOperation(
      file,
      op({ id: "set", client_mutation_id: "cm-set", entity_id: "set-1" }),
    );
    expect(orderOperations(set)[0].lane).toBe("DATA");
  });
});

describe("motor de sincronização", () => {
  it("oscilação online/offline não perde nem duplica", async () => {
    const applied = new Set<string>();
    const send = async (item: SyncOperation): Promise<SyncSendResult> => {
      applied.add(item.client_mutation_id);
      return { kind: "acked" };
    };
    let queue = enqueueOperation(
      [],
      op({ id: "set", client_mutation_id: "cm-1", entity_id: "set-1" }),
    );
    queue = (await runSyncPass({ operations: queue, send, isOnline: false })).operations;
    expect(pendingDataCount(queue)).toBe(1);
    queue = (await runSyncPass({ operations: queue, send, isOnline: true })).operations;
    queue = (await runSyncPass({ operations: queue, send, isOnline: false })).operations;
    queue = (await runSyncPass({ operations: queue, send, isOnline: true, forceRetry: true }))
      .operations;
    expect(queue[0].status).toBe("SINCRONIZADO");
    expect(applied.size).toBe(1);
  });

  it("resposta perdida não duplica a entidade", async () => {
    const applied: string[] = [];
    let first = true;
    const send = async (item: SyncOperation): Promise<SyncSendResult> => {
      if (applied.includes(item.client_mutation_id)) return { kind: "already_applied" };
      applied.push(item.client_mutation_id);
      if (first) {
        first = false;
        throw new Error("network");
      }
      return { kind: "acked" };
    };
    let queue = enqueueOperation(
      [],
      op({ id: "set", client_mutation_id: "cm-lost", entity_id: "set-1" }),
    );
    queue = (await runSyncPass({ operations: queue, send, isOnline: true })).operations;
    expect(queue[0].status).toBe("ERRO_RECUPERAVEL");
    queue = (
      await runSyncPass({
        operations: queue,
        send,
        isOnline: true,
        forceRetry: true,
        now: new Date("2026-08-26T21:10:00.000Z"),
      })
    ).operations;
    expect(queue[0].status).toBe("SINCRONIZADO");
    expect(applied).toEqual(["cm-lost"]);
  });

  it("erro permanente não entra em loop", async () => {
    const send = async (): Promise<SyncSendResult> => ({
      kind: "permanent",
      errorCode: "permission_denied",
    });
    let queue = enqueueOperation(
      [],
      op({ id: "set", client_mutation_id: "cm-perm", entity_id: "set-1" }),
    );
    queue = (await runSyncPass({ operations: queue, send, isOnline: true })).operations;
    const second = await runSyncPass({ operations: queue, send, isOnline: true, forceRetry: true });
    expect(second.operations[0].status).toBe("ERRO_PERMANENTE");
    expect(second.metrics.sync_success).toBe(0);
  });
});

describe("backoff", () => {
  it("cresce e respeita espera", () => {
    expect(retryDelayMs(1)).toBe(1000);
    expect(retryDelayMs(6)).toBe(30000);
    const last = new Date("2026-08-26T21:00:00.000Z");
    expect(nextRetryAt(1, last).toISOString()).toBe("2026-08-26T21:00:01.000Z");
    expect(
      canRetryAt({
        attemptCount: 1,
        lastAttemptAt: last.toISOString(),
        now: new Date("2026-08-26T21:00:00.500Z"),
      }),
    ).toBe(false);
    expect(
      canRetryAt({
        attemptCount: 1,
        lastAttemptAt: last.toISOString(),
        now: new Date("2026-08-26T21:00:00.500Z"),
        force: true,
      }),
    ).toBe(true);
  });
});

describe("conflitos", () => {
  it("não usa last-write-wins para série e não descarta", () => {
    const resolution = resolveConflict({
      domain: "set_result",
      sessionActive: true,
      localExists: true,
      remoteExists: true,
    });
    expect(resolution.discardSilent).toBe(false);
    expect(resolution.decision).toBe("keep_both");
  });

  it("sessão ativa local prevalece sobre prescrição remota", () => {
    const active = resolveConflict({
      domain: "prescription",
      sessionActive: true,
      localExists: true,
      remoteExists: true,
    });
    expect(active.decision).toBe("keep_local");
    const later = resolveConflict({
      domain: "program",
      sessionActive: false,
      localExists: true,
      remoteExists: true,
    });
    expect(later.decision).toBe("apply_domain_rule");
  });

  it("na dúvida preserva para reconciliação", () => {
    const resolution = resolveConflict({
      domain: "nutrition",
      sessionActive: false,
      localExists: true,
      remoteExists: true,
    });
    expect(resolution.decision).toBe("preserve_for_reconciliation");
  });
});

describe("copy de interface", () => {
  it("não expõe enums internos", () => {
    expect(connectionUiCopy("ONLINE_SYNCED")).toBe("Sincronizado");
    expect(connectionUiCopy("ONLINE_SYNCING")).toBe("Sincronizando...");
    expect(pendingCountCopy(3)).toBe("3 alterações aguardando sincronização");
    expect(coachUnavailableCopy()).toBe("Coach temporariamente indisponível offline.");
    expect(FEATURE_CAPABILITY.remote_coach).toBe("ONLINE_REQUIRED");
    expect(recoveredSessionCopy("2026-08-26T21:07:00.000Z")).toMatch(
      /Você iniciou esta sessão às \d{2}:\d{2}\./,
    );
    expect(
      deriveConnectionUiKind({
        online: false,
        syncing: false,
        pendingCount: 2,
        hasError: false,
        offlineReady: true,
      }),
    ).toBe("OFFLINE_READY");
  });
});

describe("recuperação após fechamento", () => {
  it("reabre a sessão persistida sem duplicar", () => {
    const snapshot = {
      status: "active" as const,
      startedAt: "2026-08-26T21:07:00.000Z",
      recorded: [{ clientMutationId: "cm-1", setId: "set-1" }],
    };
    const reopened = JSON.parse(JSON.stringify(snapshot)) as typeof snapshot;
    expect(reopened.status).toBe("active");
    expect(reopened.recorded).toHaveLength(1);
    const queue = enqueueOperation(
      [],
      op({ id: "set", client_mutation_id: "cm-1", entity_id: "set-1" }),
    );
    expect(
      enqueueOperation(queue, op({ id: "dup", client_mutation_id: "cm-1", entity_id: "set-1" })),
    ).toHaveLength(1);
  });
});
