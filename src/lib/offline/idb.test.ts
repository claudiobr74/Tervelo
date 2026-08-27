import { describe, expect, it } from "vitest";
import { getKv, putKv, putQueueAll, listQueue, resetMemoryOfflineStore } from "./idb";
import type { SyncOperation } from "@/domain/offline";

describe("armazenamento local em memória", () => {
  it("isola documentos por usuário", async () => {
    resetMemoryOfflineStore();
    await putKv("user-a", "live-session", { status: "active" });
    await putKv("user-b", "live-session", { status: "idle" });
    expect(await getKv("user-a", "live-session")).toEqual({ status: "active" });
    expect(await getKv("user-b", "live-session")).toEqual({ status: "idle" });
  });

  it("lista a fila só do usuário", async () => {
    resetMemoryOfflineStore();
    const op = (user_id: string, id: string): SyncOperation => ({
      id,
      tipo: "SET_COMPLETED",
      entidade: "set_result",
      entity_id: "set-1",
      payload: {},
      created_at: "2026-08-26T21:00:00.000Z",
      updated_at: "2026-08-26T21:00:00.000Z",
      attempt_count: 0,
      last_attempt_at: null,
      status: "PENDENTE",
      error_code: null,
      dependency_ids: [],
      schema_version: 1,
      client_mutation_id: id,
      occurred_at: "2026-08-26T21:00:00.000Z",
      synced_at: null,
      user_id,
      priority: 20,
      lane: "DATA",
    });
    await putQueueAll([op("user-a", "a1"), op("user-b", "b1")]);
    const a = await listQueue("user-a");
    expect(a).toHaveLength(1);
    expect(a[0].id).toBe("a1");
  });
});
