import { patchSyncStatus } from "./status-store";

let started = false;
const listeners = new Set<(online: boolean) => void>();

export function isOnlineNow(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}

export function subscribeNetwork(listener: (online: boolean) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function startNetworkListeners() {
  if (started || typeof window === "undefined") return;
  started = true;
  const publish = () => {
    const online = isOnlineNow();
    patchSyncStatus({ online });
    for (const listener of listeners) listener(online);
  };
  window.addEventListener("online", publish);
  window.addEventListener("offline", publish);
  window.addEventListener("focus", publish);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") publish();
  });
  publish();
}
