import { deriveConnectionUiKind, type ConnectionUiKind } from "@/domain/offline";

export type SyncStatusState = {
  online: boolean;
  syncing: boolean;
  pendingCount: number;
  lastSyncedAt: string | null;
  lastError: string | null;
  offlineReady: boolean;
  kind: ConnectionUiKind;
  installAvailable: boolean;
  updateWaiting: boolean;
  booted: boolean;
};

const INITIAL: SyncStatusState = {
  online: true,
  syncing: false,
  pendingCount: 0,
  lastSyncedAt: null,
  lastError: null,
  offlineReady: false,
  kind: "ONLINE_SYNCED",
  installAvailable: false,
  updateWaiting: false,
  booted: false,
};

const listeners = new Set<() => void>();
let cached: SyncStatusState = INITIAL;

function emit() {
  for (const listener of listeners) listener();
}

function withKind(
  next: Omit<SyncStatusState, "kind"> & Partial<Pick<SyncStatusState, "kind">>,
): SyncStatusState {
  return {
    ...next,
    kind: deriveConnectionUiKind({
      online: next.online,
      syncing: next.syncing,
      pendingCount: next.pendingCount,
      hasError: Boolean(next.lastError),
      offlineReady: next.offlineReady,
    }),
  };
}

export function getSyncStatus(): SyncStatusState {
  return cached;
}

export function getServerSyncStatus(): SyncStatusState {
  return INITIAL;
}

export function subscribeSyncStatus(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function patchSyncStatus(patch: Partial<SyncStatusState>) {
  cached = withKind({ ...cached, ...patch });
  emit();
}

export function markOfflineBooted() {
  patchSyncStatus({ booted: true });
}
