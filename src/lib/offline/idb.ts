import type { SyncOperation } from "@/domain/offline";

export const OFFLINE_DB_NAME = "tervelo-offline";
export const OFFLINE_DB_VERSION = 1;

export type KvRecord = {
  id: string;
  userId: string;
  key: string;
  value: unknown;
  updatedAt: string;
};

type QueueRecord = SyncOperation;

type MemoryDb = {
  kv: Map<string, KvRecord>;
  queue: Map<string, QueueRecord>;
  meta: Map<string, unknown>;
};

const memory: MemoryDb = {
  kv: new Map(),
  queue: new Map(),
  meta: new Map(),
};

let nativeDb: IDBDatabase | null = null;
const writeChains = new Map<string, Promise<void>>();

function kvId(userId: string, key: string): string {
  return `${userId}:${key}`;
}

function hasIndexedDb(): boolean {
  return typeof indexedDB !== "undefined";
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("idb_error"));
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("idb_tx_error"));
    tx.onabort = () => reject(tx.error ?? new Error("idb_tx_abort"));
  });
}

function upgrade(db: IDBDatabase) {
  if (!db.objectStoreNames.contains("kv")) {
    const kv = db.createObjectStore("kv", { keyPath: "id" });
    kv.createIndex("userId", "userId", { unique: false });
  }
  if (!db.objectStoreNames.contains("sync_queue")) {
    const queue = db.createObjectStore("sync_queue", { keyPath: "id" });
    queue.createIndex("userId", "userId", { unique: false });
    queue.createIndex("status", "status", { unique: false });
  }
  if (!db.objectStoreNames.contains("meta")) {
    db.createObjectStore("meta", { keyPath: "key" });
  }
}

export async function openOfflineDb(): Promise<void> {
  if (!hasIndexedDb()) return;
  if (nativeDb) return;
  nativeDb = await new Promise((resolve, reject) => {
    const request = indexedDB.open(OFFLINE_DB_NAME, OFFLINE_DB_VERSION);
    request.onupgradeneeded = () => upgrade(request.result);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("idb_open_failed"));
  });
}

export function resetMemoryOfflineStore() {
  memory.kv.clear();
  memory.queue.clear();
  memory.meta.clear();
}

export async function getKv<T>(userId: string, key: string): Promise<T | null> {
  const id = kvId(userId, key);
  if (!hasIndexedDb()) {
    return (memory.kv.get(id)?.value as T | undefined) ?? null;
  }
  await openOfflineDb();
  if (!nativeDb) return null;
  const tx = nativeDb.transaction("kv", "readonly");
  const row = await requestToPromise(tx.objectStore("kv").get(id));
  return ((row as KvRecord | undefined)?.value as T | undefined) ?? null;
}

export async function putKv(userId: string, key: string, value: unknown): Promise<void> {
  const record: KvRecord = {
    id: kvId(userId, key),
    userId,
    key,
    value,
    updatedAt: new Date().toISOString(),
  };
  if (!hasIndexedDb()) {
    memory.kv.set(record.id, record);
    return;
  }
  await openOfflineDb();
  if (!nativeDb) return;
  const tx = nativeDb.transaction("kv", "readwrite");
  tx.objectStore("kv").put(record);
  await txDone(tx);
}

export function scheduleKvWrite(userId: string, key: string, value: unknown): void {
  const id = kvId(userId, key);
  const previous = writeChains.get(id) ?? Promise.resolve();
  const next = previous.then(() => putKv(userId, key, value)).catch(() => undefined);
  writeChains.set(id, next);
}

export async function deleteKv(userId: string, key: string): Promise<void> {
  const id = kvId(userId, key);
  if (!hasIndexedDb()) {
    memory.kv.delete(id);
    return;
  }
  await openOfflineDb();
  if (!nativeDb) return;
  const tx = nativeDb.transaction("kv", "readwrite");
  tx.objectStore("kv").delete(id);
  await txDone(tx);
}

export async function putQueueOp(op: QueueRecord): Promise<void> {
  if (!hasIndexedDb()) {
    memory.queue.set(op.id, op);
    return;
  }
  await openOfflineDb();
  if (!nativeDb) return;
  const tx = nativeDb.transaction("sync_queue", "readwrite");
  tx.objectStore("sync_queue").put(op);
  await txDone(tx);
}

export async function putQueueAll(ops: QueueRecord[]): Promise<void> {
  if (!hasIndexedDb()) {
    for (const op of ops) memory.queue.set(op.id, op);
    return;
  }
  await openOfflineDb();
  if (!nativeDb) return;
  const tx = nativeDb.transaction("sync_queue", "readwrite");
  const store = tx.objectStore("sync_queue");
  for (const op of ops) store.put(op);
  await txDone(tx);
}

export async function listQueue(userId: string): Promise<QueueRecord[]> {
  if (!hasIndexedDb()) {
    return [...memory.queue.values()].filter((row) => row.user_id === userId);
  }
  await openOfflineDb();
  if (!nativeDb) return [];
  const tx = nativeDb.transaction("sync_queue", "readonly");
  const index = tx.objectStore("sync_queue").index("userId");
  const rows = await requestToPromise(index.getAll(userId));
  return (rows as QueueRecord[]) ?? [];
}

export async function getMeta<T>(key: string): Promise<T | null> {
  if (!hasIndexedDb()) {
    return (memory.meta.get(key) as T | undefined) ?? null;
  }
  await openOfflineDb();
  if (!nativeDb) return null;
  const tx = nativeDb.transaction("meta", "readonly");
  const row = await requestToPromise(tx.objectStore("meta").get(key));
  return ((row as { key: string; value: T } | undefined)?.value as T | undefined) ?? null;
}

export async function putMeta(key: string, value: unknown): Promise<void> {
  if (!hasIndexedDb()) {
    memory.meta.set(key, value);
    return;
  }
  await openOfflineDb();
  if (!nativeDb) return;
  const tx = nativeDb.transaction("meta", "readwrite");
  tx.objectStore("meta").put({ key, value });
  await txDone(tx);
}

export const KV_KEYS = {
  liveSession: "live-session",
  prescriptionSnapshot: "prescription-snapshot",
  heartRateSession: "heart-rate-session",
  athleteState: "athlete-state",
  longitudinal: "longitudinal",
  nutrition: "nutrition",
  catalogToday: "catalog-today",
  lastSyncedAt: "last-synced-at",
} as const;
