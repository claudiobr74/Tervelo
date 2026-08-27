"use client";

import Link from "next/link";
import { AthleteAppShell } from "@/components/app/athlete-shell";
import { HeartRateChart } from "@/components/app/heart-rate-chart";
import { PostWorkoutCheckoutCard } from "@/components/app/post-workout-checkout-card";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { median, metricsForSet, setWindowsFromTimeline } from "@/domain/heart-rate/metrics";
import {
  completedExercises,
  completedWorkingSets,
  durationMinutes,
  volumeKg,
} from "@/domain/training/session";
import { currentHeartRateDetails, useHeartRateRuntime } from "@/lib/heart-rate/runtime";
import { useLiveSession } from "@/lib/training/live-session";
import { PREVIEW_WORKOUT } from "@/lib/training/preview-workout";
import { useState } from "react";
import { useSyncStatus } from "@/components/app/sync-status-indicator";
import { SYNC_COPY } from "@/domain/offline";

export function WorkoutSummaryScreen() {
  const live = useLiveSession();
  const runtime = useHeartRateRuntime();
  const sync = useSyncStatus();
  const [showHrDetails, setShowHrDetails] = useState(false);
  const session = PREVIEW_WORKOUT;
  const endedAt = live.completedAt ?? new Date().toISOString();
  const startedAt = live.startedAt ?? endedAt;
  const volume = volumeKg(live.recorded);
  const setsDone = completedWorkingSets(session, live.recorded);
  // Sem série registrada não há o que resumir: repetir o planejado como se fosse
  // realizado faria o resumo contradizer a própria mensagem.
  const minutes = setsDone > 0 ? durationMinutes(startedAt, endedAt) : 0;
  const exercisesDone = setsDone > 0 ? completedExercises(session, live.recorded) : 0;
  const hr = currentHeartRateDetails();
  const recoveries = setWindowsFromTimeline(live.events)
    .map((window) => metricsForSet(hr.samples, window).recovery60Seconds)
    .filter((value): value is number => value !== null);
  const recoveryMedian = median(recoveries);
  const showHeartRate = runtime.enabled && hr.stats.sampleCount > 0;

  const finished = setsDone > 0;

  return (
    <AthleteAppShell hideNav>
      <div className="flex flex-col gap-5 px-6 pb-6 pt-4">
        <div className="flex items-center">
          <Link href="/app/today" aria-label="Voltar" className="text-foreground">
            <FigmaIcon src="/icons/arrow-left.svg" alt="" size={24} />
          </Link>
        </div>
        <div className="flex flex-col items-center gap-3 pb-2">
          <span className="flex size-16 items-center justify-center rounded-[32px] bg-brand-soft text-brand">
            <FigmaIcon src="/icons/check-circle.svg" alt="" size={32} />
          </span>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-extrabold text-foreground">
              {finished ? "Treino concluído!" : "Sessão encerrada"}
            </h1>
            <p className="text-sm text-muted">
              {!sync.online
                ? `✓ ${SYNC_COPY.savedOnDevice}`
                : finished
                  ? `${setsDone} séries registradas nesta sessão.`
                  : "Nenhuma série foi registrada desta vez."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <article className="flex flex-col gap-1 rounded-[var(--radius-lg)] border border-border bg-surface p-4">
            <p className="text-[11px] text-muted">Duração</p>
            <p className="text-lg font-bold text-foreground">{minutes} min</p>
          </article>
          <article className="flex flex-col gap-1 rounded-[var(--radius-lg)] border border-border bg-surface p-4">
            <p className="text-[11px] text-muted">Exercícios</p>
            <p className="text-lg font-bold text-foreground">{exercisesDone} concluídos</p>
          </article>
          <article className="flex flex-col gap-1 rounded-[var(--radius-lg)] border border-border bg-surface p-4">
            <p className="text-[11px] text-muted">Séries Totais</p>
            <p className="text-lg font-bold text-foreground">{setsDone} séries</p>
          </article>
          <article className="flex flex-col gap-1 rounded-[var(--radius-lg)] border border-border bg-surface p-4">
            <p className="text-[11px] text-muted">Volume de Carga</p>
            <p className="text-lg font-bold text-brand">
              {volume.toLocaleString("pt-BR")} kg
            </p>
          </article>
        </div>

        <PostWorkoutCheckoutCard />

        <article className="flex items-start gap-3 rounded-[var(--radius-xl)] border border-border bg-surface p-4">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-xl)] bg-brand-soft text-brand">
            <FigmaIcon src="/icons/brain.svg" alt="" size={16} />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-xs font-bold uppercase text-brand">Avaliação do treinador</p>
            <p className="text-[13px] text-foreground">{SYNC_COPY.pendingAnalysis}</p>
          </div>
        </article>

        {showHeartRate ? (
          <article className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-4">
            <p className="text-sm font-bold text-foreground">Resposta ao treino</p>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Frequência média</span>
                <span className="font-semibold tabular-nums text-foreground">
                  {hr.stats.averageBpm ?? "—"} batimentos/min
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Frequência máxima</span>
                <span className="font-semibold tabular-nums text-foreground">
                  {hr.stats.maximumBpm ?? "—"} batimentos/min
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Recuperação mediana em 60 segundos</span>
                <span className="font-semibold tabular-nums text-foreground">
                  {recoveryMedian != null ? `${recoveryMedian} batimentos/min` : "—"}
                </span>
              </div>
            </div>
            {!runtime.online && runtime.pendingSync > 0 ? (
              <p className="text-xs text-muted">Salvo neste dispositivo • aguardando sincronização</p>
            ) : null}
            <button
              type="button"
              onClick={() => setShowHrDetails((value) => !value)}
              className="self-start text-xs font-semibold text-brand"
            >
              {showHrDetails ? "Ocultar detalhes" : "Ver detalhes"}
            </button>
            {showHrDetails ? <HeartRateChart samples={hr.samples} events={live.events} /> : null}
          </article>
        ) : null}
      </div>
    </AthleteAppShell>
  );
}
