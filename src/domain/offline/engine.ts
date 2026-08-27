import { canRetryAt, classifyErrorCode } from "./backoff";
import { orderOperations, readyToSend } from "./queue";
import type { SyncOperation, SyncPassMetrics, SyncSendResult } from "./types";

export type SyncTransporter = (op: SyncOperation) => Promise<SyncSendResult>;

function applyResult(op: SyncOperation, result: SyncSendResult, nowIso: string): SyncOperation {
  if (result.kind === "acked" || result.kind === "already_applied") {
    return {
      ...op,
      status: "SINCRONIZADO",
      error_code: null,
      synced_at: nowIso,
      updated_at: nowIso,
    };
  }
  if (result.kind === "permanent") {
    return {
      ...op,
      status: "ERRO_PERMANENTE",
      error_code: result.errorCode,
      updated_at: nowIso,
    };
  }
  return {
    ...op,
    status: "ERRO_RECUPERAVEL",
    error_code: result.errorCode,
    updated_at: nowIso,
  };
}

function fromThrown(error: unknown): SyncSendResult {
  const message = error instanceof Error ? error.message : "network";
  const classified = classifyErrorCode(message);
  if (classified === "permanent") return { kind: "permanent", errorCode: message };
  return { kind: "recoverable", errorCode: message || "network" };
}

export async function runSyncPass(input: {
  operations: SyncOperation[];
  send: SyncTransporter;
  isOnline: boolean;
  now?: Date;
  forceRetry?: boolean;
  maxOps?: number;
}): Promise<{ operations: SyncOperation[]; metrics: SyncPassMetrics }> {
  const now = input.now ?? new Date();
  const nowIso = now.toISOString();
  const metrics: SyncPassMetrics = {
    sync_success: 0,
    sync_failure: 0,
    pending_operations: 0,
    conflict_count: 0,
    skipped_dependencies: 0,
  };

  let operations = input.operations.map((row) => ({ ...row }));
  if (!input.isOnline) {
    metrics.pending_operations = operations.filter(
      (row) => row.status === "PENDENTE" || row.status === "ERRO_RECUPERAVEL",
    ).length;
    return { operations, metrics };
  }

  const ordered = orderOperations(operations).filter((op) => op.lane === "DATA");
  const limit = input.maxOps ?? ordered.length;
  let processed = 0;

  for (const candidate of ordered) {
    if (processed >= limit) break;
    const current = operations.find((row) => row.id === candidate.id);
    if (!current) continue;
    if (current.status === "ERRO_PERMANENTE" || current.status === "SINCRONIZADO") continue;
    if (!readyToSend(current, operations)) {
      metrics.skipped_dependencies += 1;
      continue;
    }
    if (
      !canRetryAt({
        attemptCount: current.attempt_count,
        lastAttemptAt: current.last_attempt_at,
        now,
        force: input.forceRetry,
      })
    ) {
      continue;
    }

    processed += 1;
    const attempting: SyncOperation = {
      ...current,
      status: "SINCRONIZANDO",
      attempt_count: current.attempt_count + 1,
      last_attempt_at: nowIso,
      updated_at: nowIso,
    };
    operations = operations.map((row) => (row.id === current.id ? attempting : row));

    let result: SyncSendResult;
    try {
      result = await input.send(attempting);
    } catch (error) {
      result = fromThrown(error);
    }

    const next = applyResult(attempting, result, nowIso);
    operations = operations.map((row) => (row.id === current.id ? next : row));
    if (next.status === "SINCRONIZADO") metrics.sync_success += 1;
    else metrics.sync_failure += 1;
  }

  metrics.pending_operations = operations.filter(
    (row) => row.status === "PENDENTE" || row.status === "ERRO_RECUPERAVEL" || row.status === "SINCRONIZANDO",
  ).length;
  return { operations, metrics };
}
