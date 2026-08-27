import { pendingDataCount, runSyncPass, sanitizeSyncLog } from "@/domain/offline";
import { isOnlineNow, startNetworkListeners, subscribeNetwork } from "./network";
import { getSyncQueue, pendingSyncCount, replaceSyncQueue } from "./queue-store";
import { patchSyncStatus } from "./status-store";
import { transportSyncOperation } from "./transporter";
import { getKv, KV_KEYS, putKv } from "./idb";
import { currentOfflineUserId } from "./user-scope";

let running = false;
let started = false;

function isPreviewUnavailable(code: string | null): boolean {
  return code === "nhost_unavailable";
}

export async function requestSync(options?: { force?: boolean }) {
  if (running) return;
  running = true;
  patchSyncStatus({ syncing: true });
  const startedAt = Date.now();
  try {
    const result = await runSyncPass({
      operations: getSyncQueue(),
      send: transportSyncOperation,
      isOnline: isOnlineNow(),
      forceRetry: options?.force,
    });
    replaceSyncQueue(result.operations);
    const pending = pendingDataCount(result.operations);
    const permanent = result.operations.find((row) => row.status === "ERRO_PERMANENTE");
    const noisyRecoverable = result.operations.find(
      (row) =>
        row.status === "ERRO_RECUPERAVEL" && !isPreviewUnavailable(row.error_code) && isOnlineNow(),
    );
    if (result.metrics.sync_success > 0) {
      const at = new Date().toISOString();
      await putKv(currentOfflineUserId(), KV_KEYS.lastSyncedAt, at);
      patchSyncStatus({ lastSyncedAt: at });
    }
    patchSyncStatus({
      pendingCount: pending,
      lastError: permanent?.error_code ?? noisyRecoverable?.error_code ?? null,
    });
    if (result.metrics.sync_failure > 0) {
      const failed = result.operations.find(
        (row) => row.status !== "SINCRONIZADO" && row.status !== "PENDENTE",
      );
      if (failed) {
        void sanitizeSyncLog({
          opId: failed.id,
          entity: failed.entidade,
          status: failed.status,
          errorCode: failed.error_code,
        });
      }
    }
    void startedAt;
  } finally {
    running = false;
    patchSyncStatus({ syncing: false, pendingCount: pendingSyncCount() });
  }
}

export function startSyncEngine() {
  if (started) return;
  started = true;
  startNetworkListeners();
  subscribeNetwork((online) => {
    if (online) void requestSync({ force: true });
  });
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && isOnlineNow()) {
        void requestSync({ force: true });
      }
    });
  }
  if (isOnlineNow()) void requestSync();
}

export async function hydrateLastSyncedAt() {
  const at = await getKv<string>(currentOfflineUserId(), KV_KEYS.lastSyncedAt);
  if (at) patchSyncStatus({ lastSyncedAt: at });
}
