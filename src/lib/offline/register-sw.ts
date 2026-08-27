import { getLiveSession } from "@/lib/training/live-session";
import { patchSyncStatus } from "./status-store";

const INSTALL_DISMISS_KEY = "tervelo-pwa-install-dismissed";

export function registerTerveloServiceWorker() {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "production") return;
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    const dismissed = window.localStorage.getItem(INSTALL_DISMISS_KEY) === "1";
    if (dismissed) return;
    patchSyncStatus({ installAvailable: true });
    (window as Window & { __terveloInstall?: Event }).__terveloInstall = event;
  });

  void navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).then((registration) => {
    registration.addEventListener("updatefound", () => {
      const worker = registration.installing;
      if (!worker) return;
      worker.addEventListener("statechange", () => {
        if (worker.state !== "installed" || !navigator.serviceWorker.controller) return;
        const live = getLiveSession();
        if (live.status === "active" || live.status === "resting") {
          patchSyncStatus({ updateWaiting: true });
          return;
        }
        patchSyncStatus({ updateWaiting: true });
      });
    });
  });
}

export function dismissInstallPrompt() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(INSTALL_DISMISS_KEY, "1");
  patchSyncStatus({ installAvailable: false });
}

export async function promptInstall(): Promise<void> {
  const event = (window as Window & { __terveloInstall?: BeforeInstallPromptEvent }).__terveloInstall;
  if (!event) return;
  await event.prompt();
  patchSyncStatus({ installAvailable: false });
}

export function applyWaitingServiceWorker() {
  const live = getLiveSession();
  if (live.status === "active" || live.status === "resting") return;
  void navigator.serviceWorker.getRegistration().then((registration) => {
    registration?.waiting?.postMessage({ type: "SKIP_WAITING" });
  });
}

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void> };
