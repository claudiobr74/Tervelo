import {
  LOCAL_SCHEMA_VERSION,
  type NewSyncOperation,
  type SyncOperation,
  type SyncOpStatus,
} from "./types";
import { priorityFor } from "./priority";

const OPEN_STATUSES: SyncOpStatus[] = ["PENDENTE", "SINCRONIZANDO", "ERRO_RECUPERAVEL"];

export function enqueueOperation(queue: SyncOperation[], item: NewSyncOperation): SyncOperation[] {
  if (queue.some((row) => row.client_mutation_id === item.client_mutation_id)) {
    return queue;
  }
  const now = item.created_at ?? new Date().toISOString();
  const next: SyncOperation = {
    id: item.id,
    tipo: item.tipo,
    entidade: item.entidade,
    entity_id: item.entity_id,
    payload: item.payload,
    created_at: now,
    updated_at: now,
    attempt_count: 0,
    last_attempt_at: null,
    status: "PENDENTE",
    error_code: null,
    dependency_ids: item.dependency_ids ?? [],
    schema_version: LOCAL_SCHEMA_VERSION,
    client_mutation_id: item.client_mutation_id,
    occurred_at: item.occurred_at,
    synced_at: null,
    user_id: item.user_id,
    priority: item.priority ?? priorityFor(item.entidade, item.tipo),
    lane: item.lane ?? "DATA",
  };
  return [...queue, next];
}

export function pendingOperations(queue: SyncOperation[]): SyncOperation[] {
  return queue.filter((row) => OPEN_STATUSES.includes(row.status));
}

export function pendingDataCount(queue: SyncOperation[]): number {
  return pendingOperations(queue).filter((row) => row.lane === "DATA").length;
}

export function markStatus(
  queue: SyncOperation[],
  id: string,
  patch: Partial<
    Pick<
      SyncOperation,
      "status" | "error_code" | "synced_at" | "attempt_count" | "last_attempt_at" | "updated_at"
    >
  >,
): SyncOperation[] {
  return queue.map((row) => (row.id === id ? { ...row, ...patch } : row));
}

function dependenciesSatisfied(op: SyncOperation, byId: Map<string, SyncOperation>): boolean {
  return op.dependency_ids.every((depId) => {
    const parent = byId.get(depId);
    if (!parent) return true;
    return parent.status === "SINCRONIZADO";
  });
}

export function orderOperations(queue: SyncOperation[]): SyncOperation[] {
  const byId = new Map(queue.map((row) => [row.id, row]));
  const open = pendingOperations(queue).slice();
  open.sort((a, b) => {
    if (a.lane !== b.lane) return a.lane === "DATA" ? -1 : 1;
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.created_at.localeCompare(b.created_at);
  });

  const ordered: SyncOperation[] = [];
  const placed = new Set<string>();
  let guard = open.length + 1;
  while (ordered.length < open.length && guard > 0) {
    guard -= 1;
    let progressed = false;
    for (const op of open) {
      if (placed.has(op.id)) continue;
      const depsReady = op.dependency_ids.every((depId) => {
        const parent = byId.get(depId);
        if (!parent) return true;
        if (parent.status === "SINCRONIZADO") return true;
        return placed.has(depId);
      });
      if (depsReady) {
        ordered.push(op);
        placed.add(op.id);
        progressed = true;
      }
    }
    if (!progressed) {
      for (const op of open) {
        if (!placed.has(op.id)) {
          ordered.push(op);
          placed.add(op.id);
        }
      }
    }
  }
  return ordered;
}

export function readyToSend(op: SyncOperation, queue: SyncOperation[]): boolean {
  const byId = new Map(queue.map((row) => [row.id, row]));
  return dependenciesSatisfied(op, byId);
}

export function isolateByUser(queue: SyncOperation[], userId: string): SyncOperation[] {
  return queue.filter((row) => row.user_id === userId);
}
