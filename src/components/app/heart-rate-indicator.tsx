"use client";

import { useState } from "react";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { HeartRateDetailsSheet } from "@/components/app/heart-rate-details";
import {
  connectHeartRateMonitor,
  reconnectHeartRateMonitor,
  useHeartRateRuntime,
} from "@/lib/heart-rate/runtime";

export function HeartRateWorkoutIndicator({ compact = false }: { compact?: boolean }) {
  const runtime = useHeartRateRuntime();
  const [open, setOpen] = useState(false);
  if (!runtime.enabled) return null;

  const disconnected = runtime.status === "DISCONNECTED" || runtime.status === "READY" || runtime.status === "ERROR";
  const waiting = runtime.status === "CONNECTING" || runtime.status === "RECONNECTING" || runtime.status === "CONNECTED";
  const label =
    runtime.status === "STREAMING" && runtime.bpm !== null
      ? `${runtime.bpm}`
      : "—";
  const caption =
    runtime.status === "STREAMING"
      ? "Conectado"
      : waiting
        ? "Aguardando leitura"
        : runtime.status === "UNSUPPORTED"
          ? "Indisponível neste navegador"
          : "Desconectado";

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex min-w-0 items-center gap-2 text-left"
          aria-label="Frequência cardíaca"
        >
          <FigmaIcon src="/icons/heart.svg" alt="" size={16} className="text-brand" />
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {label}
            {compact ? "" : runtime.status === "STREAMING" ? " batimentos/min" : ""}
          </span>
          <span className="truncate text-xs text-muted">{caption}</span>
        </button>
        {disconnected && runtime.status !== "UNSUPPORTED" ? (
          <button
            type="button"
            onClick={() => void (runtime.status === "DISCONNECTED" ? reconnectHeartRateMonitor() : connectHeartRateMonitor())}
            className="shrink-0 rounded-[var(--radius-md)] border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground"
          >
            {runtime.status === "DISCONNECTED" ? "Reconectar" : "Conectar"}
          </button>
        ) : null}
      </div>
      {runtime.status === "UNSUPPORTED" ? (
        <p className="text-xs text-muted">O treino continuará funcionando normalmente.</p>
      ) : null}
      {open ? <HeartRateDetailsSheet onClose={() => setOpen(false)} /> : null}
    </>
  );
}
