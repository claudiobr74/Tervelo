"use client";

import { useSyncExternalStore } from "react";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { connectionUiCopy, pendingCountCopy, SYNC_COPY } from "@/domain/offline";
import {
  getServerSyncStatus,
  getSyncStatus,
  subscribeSyncStatus,
} from "@/lib/offline/status-store";

export function useSyncStatus() {
  return useSyncExternalStore(subscribeSyncStatus, getSyncStatus, getServerSyncStatus);
}

export function SyncStatusIndicator({ compact = false }: { compact?: boolean }) {
  const status = useSyncStatus();
  if (status.kind === "ONLINE_SYNCED" && !compact) return null;

  const label =
    status.kind === "OFFLINE_READY" || status.kind === "OFFLINE_PARTIAL"
      ? compact
        ? SYNC_COPY.offlineSavedDevice
        : SYNC_COPY.bannerOffline
      : status.kind === "SYNC_PENDING"
        ? pendingCountCopy(status.pendingCount)
        : connectionUiCopy(status.kind, status.pendingCount);

  if (status.kind === "ONLINE_SYNCED") return null;

  return (
    <p
      className="flex items-center gap-2 text-[11px] font-medium text-muted"
      role="status"
      aria-live="polite"
    >
      <FigmaIcon
        src={status.online ? "/icons/refresh-cw.svg" : "/icons/alert-triangle.svg"}
        alt=""
        size={14}
        className={status.kind === "SYNC_ERROR" ? "text-error" : "text-muted"}
      />
      <span>{label}</span>
      <span className="sr-only">{status.online ? label : SYNC_COPY.noConnectionA11y}</span>
    </p>
  );
}

export function WorkoutSyncHint() {
  const status = useSyncStatus();
  if (status.kind === "ONLINE_SYNCED") return null;
  const label = !status.online
    ? SYNC_COPY.offlineSaving
    : status.syncing
      ? SYNC_COPY.syncing
      : status.pendingCount > 0
        ? pendingCountCopy(status.pendingCount)
        : SYNC_COPY.synced;
  return (
    <p className="flex items-center gap-1.5 text-[11px] text-muted" role="status">
      <FigmaIcon src="/icons/info.svg" alt="" size={12} className="text-muted" />
      {label}
    </p>
  );
}
