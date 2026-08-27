"use client";

import { median, metricsForSet, setWindowsFromTimeline } from "@/domain/heart-rate/metrics";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { currentHeartRateDetails, useHeartRateRuntime } from "@/lib/heart-rate/runtime";
import { useLiveSession } from "@/lib/training/live-session";

export function HeartRateDetailsSheet({ onClose }: { onClose: () => void }) {
  const runtime = useHeartRateRuntime();
  const live = useLiveSession();
  const details = currentHeartRateDetails();
  const windows = setWindowsFromTimeline(live.events);
  const lastWindow = windows.at(-1);
  const lastMetrics = lastWindow ? metricsForSet(details.samples, lastWindow) : null;
  const recoveries = windows
    .map((window) => metricsForSet(details.samples, window).recovery60Seconds)
    .filter((value): value is number => value !== null);

  const connected = runtime.status === "STREAMING" || runtime.status === "CONNECTED";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 sm:items-center" role="dialog" aria-labelledby="hr-details-title">
      <button type="button" className="absolute inset-0" aria-label="Fechar" onClick={onClose} />
      <div className="relative z-10 w-full max-w-[390px] rounded-t-[var(--radius-xl)] border border-border bg-surface p-5 sm:rounded-[var(--radius-xl)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="hr-details-title" className="text-base font-bold text-foreground">
            Frequência cardíaca
          </h2>
          <button type="button" onClick={onClose} className="text-sm font-semibold text-muted">
            Fechar
          </button>
        </div>
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Agora</dt>
            <dd className="font-semibold tabular-nums text-foreground">
              {runtime.bpm !== null ? `${runtime.bpm} batimentos/min` : "—"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Média da sessão</dt>
            <dd className="font-semibold tabular-nums text-foreground">
              {details.stats.averageBpm !== null ? `${details.stats.averageBpm} batimentos/min` : "—"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Máxima</dt>
            <dd className="font-semibold tabular-nums text-foreground">
              {details.stats.maximumBpm !== null ? `${details.stats.maximumBpm} batimentos/min` : "—"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Última recuperação em 60 segundos</dt>
            <dd className="font-semibold tabular-nums text-foreground">
              {lastMetrics?.recovery60Seconds != null
                ? `${lastMetrics.recovery60Seconds} batimentos/min`
                : median(recoveries) != null
                  ? `${median(recoveries)} batimentos/min`
                  : "—"}
            </dd>
          </div>
          {lastMetrics ? (
            <>
              <div className="flex justify-between">
                <dt className="text-muted">Antes da série</dt>
                <dd className="tabular-nums text-foreground">{lastMetrics.heartRateBeforeSet ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Pico</dt>
                <dd className="tabular-nums text-foreground">{lastMetrics.heartRatePeak ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Após 60 segundos</dt>
                <dd className="tabular-nums text-foreground">{lastMetrics.heartRateAfter60Seconds ?? "—"}</dd>
              </div>
            </>
          ) : null}
          <div className="flex items-center justify-between border-t border-border pt-3">
            <div>
              <p className="text-xs text-muted">Dispositivo</p>
              <p className="font-semibold text-foreground">{runtime.deviceName ?? "Nenhum frequencímetro conectado"}</p>
            </div>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <span className={`size-2 rounded-full ${connected ? "bg-success" : "bg-surface-interactive"}`} />
              {connected ? "Conectado" : "Desconectado"}
            </p>
          </div>
        </dl>
        <p className="mt-4 flex items-start gap-2 text-xs text-muted">
          <FigmaIcon src="/icons/info.svg" alt="" size={14} className="mt-0.5 text-muted" />
          A frequência cardíaca complementa o treino. Ela não substitui carga, repetições nem esforço percebido.
        </p>
      </div>
    </div>
  );
}
