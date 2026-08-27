import {
  enqueueOperation,
  pendingDataCount,
  type NewSyncOperation,
  type SyncOperation,
} from "@/domain/offline";
import { listQueue, putQueueAll } from "./idb";
import { currentOfflineUserId } from "./user-scope";

const listeners = new Set<() => void>();
let cached: SyncOperation[] = [];
let hydrated = false;

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeSyncQueue(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSyncQueue(): SyncOperation[] {
  return cached;
}

export function pendingSyncCount(): number {
  return pendingDataCount(cached);
}

export function hydrateSyncQueue(ops: SyncOperation[]) {
  if (
    hydrated &&
    cached.some((row) => row.status === "PENDENTE" || row.status === "SINCRONIZANDO")
  ) {
    const incoming = new Map(ops.map((row) => [row.id, row]));
    const merged = cached.map((row) => incoming.get(row.id) ?? row);
    for (const row of ops) {
      if (
        !merged.some(
          (item) => item.id === row.id || item.client_mutation_id === row.client_mutation_id,
        )
      ) {
        merged.push(row);
      }
    }
    cached = merged;
    emit();
    return;
  }
  cached = ops;
  hydrated = true;
  emit();
}

export function replaceSyncQueue(ops: SyncOperation[]) {
  cached = ops;
  hydrated = true;
  emit();
  void putQueueAll(ops);
}

export function enqueueSync(item: NewSyncOperation): SyncOperation {
  const next = enqueueOperation(cached, item);
  const created = next.find((row) => row.client_mutation_id === item.client_mutation_id);
  cached = next;
  emit();
  void putQueueAll(next);
  return created ?? next[next.length - 1];
}

export async function loadSyncQueueFromIdb(userId = currentOfflineUserId()) {
  const rows = await listQueue(userId);
  hydrateSyncQueue(rows);
}
