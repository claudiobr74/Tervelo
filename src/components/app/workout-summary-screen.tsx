"use client";

import { AthleteAppShell } from "@/components/app/athlete-shell";
import { FigmaIcon } from "@/components/auth/figma-icon";
import {
  completedExercises,
  completedWorkingSets,
  durationMinutes,
  volumeKg,
} from "@/domain/training/session";
import { useLiveSession } from "@/lib/training/live-session";
import { PREVIEW_WORKOUT } from "@/lib/training/preview-workout";

export function WorkoutSummaryScreen() {
  const live = useLiveSession();
  const session = PREVIEW_WORKOUT;
  const endedAt = live.completedAt ?? new Date().toISOString();
  const startedAt = live.startedAt ?? endedAt;
  const minutes = durationMinutes(startedAt, endedAt) || session.estimatedMinutes;
  const volume = volumeKg(live.recorded);
  const exercisesDone = completedExercises(session, live.recorded) || session.exercises.length;
  const setsDone = completedWorkingSets(session, live.recorded);

  return (
    <AthleteAppShell active="Treino">
      <div className="flex flex-col gap-5 px-6 pb-6 pt-4">
        <div className="flex flex-col items-center gap-3 pb-2 pt-2">
          <span className="flex size-16 items-center justify-center rounded-[32px] bg-brand-soft text-brand">
            <FigmaIcon src="/icons/check-circle.svg" alt="" size={32} />
          </span>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-extrabold text-foreground">Treino Concluído!</h1>
            <p className="text-sm text-muted">Excelente sessão. Sua consistência garante os resultados.</p>
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

        <article className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-4">
          <FigmaIcon src="/icons/trending-up.svg" alt="" size={24} className="text-success" />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="text-sm font-bold text-foreground">Desempenho Geral superior</p>
            <p className="text-xs text-muted">
              Volume total de carga aumentado em 5% comparado ao último treino.
            </p>
          </div>
        </article>

        <article className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-4">
          <p className="text-sm font-bold text-foreground">Percepção de Esforço</p>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <p className="text-muted">Energia ao treinar</p>
              <p className="font-semibold text-brand">Alta</p>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-surface-interactive">
              <div className="h-full w-4/5 rounded-full bg-brand" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <p className="text-muted">Dificuldade geral</p>
              <p className="font-semibold text-brand">Moderada (RPE 8)</p>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-surface-interactive">
              <div className="h-full w-[70%] rounded-full bg-brand" />
            </div>
          </div>
        </article>

        <article className="flex items-start gap-3 rounded-[var(--radius-xl)] border border-border bg-surface p-4">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-xl)] bg-brand-soft text-brand">
            <FigmaIcon src="/icons/brain.svg" alt="" size={16} />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-xs font-bold uppercase text-brand">Avaliação do treinador</p>
            <p className="text-[13px] text-foreground">
              “Você apresentou melhora no supino e manteve o desempenho das demais séries. Não há
              necessidade de alterar o planejamento da próxima sessão.”
            </p>
          </div>
        </article>
      </div>
    </AthleteAppShell>
  );
}
