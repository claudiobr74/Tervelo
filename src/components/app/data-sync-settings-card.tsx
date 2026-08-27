"use client";

import { FigmaIcon } from "@/components/auth/figma-icon";
import { formatLastSyncedAt, pendingCountCopy, SYNC_COPY } from "@/domain/offline";
import { requestSync } from "@/lib/offline/engine-runner";
import {
  applyWaitingServiceWorker,
  dismissInstallPrompt,
  promptInstall,
} from "@/lib/offline/register-sw";
import { useSyncStatus } from "@/components/app/sync-status-indicator";

export function DataSyncSettingsCard() {
  const status = useSyncStatus();
  const last = formatLastSyncedAt(status.lastSyncedAt);

  return (
    <section className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-4">
      <h2 className="text-base font-bold text-foreground">{SYNC_COPY.dataAndSync}</h2>
      <p className="text-sm text-muted">{SYNC_COPY.settingsIntro}</p>

      <div className="flex flex-col gap-2 border-t border-border pt-3">
        <p className="text-xs font-bold uppercase text-muted">{SYNC_COPY.usageOffline}</p>
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <FigmaIcon src="/icons/check-circle.svg" alt="" size={16} className="text-success" />
          {status.offlineReady ? SYNC_COPY.nextWorkoutReady : SYNC_COPY.nextWorkoutPartial}
        </p>
        <p className="text-xs text-muted">
          {SYNC_COPY.lastSync}: {last ?? SYNC_COPY.notYetSynced}
        </p>
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-3">
        <p className="text-xs font-bold uppercase text-muted">{SYNC_COPY.syncSection}</p>
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <FigmaIcon
            src={status.lastError ? "/icons/alert-triangle.svg" : "/icons/check.svg"}
            alt=""
            size={16}
            className={status.lastError ? "text-error" : "text-success"}
          />
          {status.lastError ? SYNC_COPY.syncError : pendingCountCopy(status.pendingCount)}
        </p>
        <button
          type="button"
          onClick={() => void requestSync({ force: true })}
          className="flex h-11 items-center justify-center rounded-[var(--radius-md)] border border-border text-sm font-bold text-foreground"
        >
          {SYNC_COPY.syncNow}
        </button>
      </div>

      {status.installAvailable ? (
        <div className="flex flex-col gap-2 border-t border-border pt-3">
          <button
            type="button"
            onClick={() => void promptInstall()}
            className="text-sm font-semibold text-brand"
          >
            {SYNC_COPY.install}
          </button>
          <button type="button" onClick={dismissInstallPrompt} className="text-xs text-muted">
            Agora não
          </button>
        </div>
      ) : null}

      {status.updateWaiting ? (
        <button
          type="button"
          onClick={applyWaitingServiceWorker}
          className="text-sm font-semibold text-brand"
        >
          {SYNC_COPY.updateAvailable}
        </button>
      ) : null}
    </section>
  );
}
