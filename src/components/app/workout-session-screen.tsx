"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AthleteAppShell } from "@/components/app/athlete-shell";
import { FigmaIcon } from "@/components/auth/figma-icon";
import {
  formatKg,
  formatRest,
  formatSetsAndReps,
  workingSets,
} from "@/domain/training/session";
import { startWorkout } from "@/lib/training/live-session";
import { PREVIEW_WORKOUT } from "@/lib/training/preview-workout";

export function WorkoutSessionScreen() {
  const router = useRouter();
  const session = PREVIEW_WORKOUT;

  function begin() {
    startWorkout();
    router.push("/app/workout/exercise");
  }

  return (
    <AthleteAppShell active="Treino">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-col gap-3 px-6 pb-5 pt-4">
          <div className="flex items-center justify-between">
            <Link href="/app/today" aria-label="Voltar" className="text-foreground">
              <FigmaIcon src="/icons/arrow-left.svg" alt="" size={24} />
            </Link>
            <p className="text-base font-semibold text-foreground">Sessão de Treino</p>
            <button type="button" title="FIGMA_PENDING" aria-label="Mais opções" className="text-foreground">
              <FigmaIcon src="/icons/more-vertical.svg" alt="" size={24} />
            </button>
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-foreground">{session.title}</h1>
            <p className="text-[13px] text-muted">
              {session.programLabel} • {session.estimatedMinutes} min estimados
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 px-6 pb-4">
          {session.exercises.map((exercise, index) => {
            const work = workingSets(exercise);
            const first = work[0];
            return (
              <article
                key={exercise.id}
                className="flex flex-col gap-3 rounded-[var(--radius-xl)] border border-border bg-surface p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="text-[11px] font-bold uppercase text-brand">{exercise.muscleGroup}</p>
                    <h2 className="text-base font-bold text-foreground">
                      {index + 1}. {exercise.namePt}
                    </h2>
                  </div>
                  <span className="relative block size-12 shrink-0 overflow-clip rounded-[var(--radius-md)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={exercise.imageSrc ?? "/icons/body-placeholder.svg"}
                      alt=""
                      width={48}
                      height={48}
                      className="size-full object-cover"
                    />
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[11px] text-muted">Séries e Reps</p>
                    <p className="text-[13px] font-semibold text-foreground">{formatSetsAndReps(exercise)}</p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[11px] text-muted">Carga Anterior</p>
                    <p className="text-[13px] font-semibold text-muted">
                      {exercise.previousLabel ?? formatKg(first?.previousWeightKg ?? null)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[11px] text-muted">Carga Sugerida</p>
                    <p className="text-[13px] font-bold text-brand">
                      {exercise.suggestedLabel ?? formatKg(first?.suggestedWeightKg ?? null)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2">
                  <p className="text-xs text-muted">
                    Intervalo: {formatRest(exercise.restSeconds)}
                    <span className="mx-2 text-tertiary">|</span>
                    Repetições em reserva: {first?.targetRepsInReserve ?? 2}
                  </p>
                  <div className="flex gap-2">
                    <Link href="/app/exercises" aria-label="Substituir exercício" className="text-muted">
                      <FigmaIcon src="/icons/refresh-cw.svg" alt="" size={16} />
                    </Link>
                    <button type="button" title="FIGMA_PENDING" aria-label="Reportar" className="text-muted">
                      <FigmaIcon src="/icons/alert-triangle.svg" alt="" size={16} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <div className="sticky bottom-0 bg-background p-6">
          <button
            type="button"
            onClick={begin}
            className="flex h-[54px] w-full items-center justify-center rounded-[var(--radius-lg)] bg-brand text-base font-bold text-on-brand"
          >
            Começar exercício
          </button>
        </div>
      </div>
    </AthleteAppShell>
  );
}
