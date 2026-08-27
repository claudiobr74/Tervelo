"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AthleteAppShell } from "@/components/app/athlete-shell";
import { WorkoutSyncHint } from "@/components/app/sync-status-indicator";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { SYNC_COPY } from "@/domain/offline";
import {
  formatKg,
  formatRest,
  formatSetsAndReps,
  workingSets,
} from "@/domain/training/session";
import { startWorkout, useLiveSession } from "@/lib/training/live-session";
import { PREVIEW_WORKOUT } from "@/lib/training/preview-workout";
import { shouldPromptPreWorkoutCheckin } from "@/domain/athlete-state/gates";
import { getPreWorkoutCheckinEnabled } from "@/lib/athlete-state/preference-store";
import { getAthleteStateStore } from "@/lib/athlete-state/session-store";

function ExerciseThumb({ src }: { src: string }) {
  const [missing, setMissing] = useState(false);
  if (missing) {
    return <p className="max-w-16 text-[10px] leading-tight text-muted">{SYNC_COPY.mediaWhenOnline}</p>;
  }
  return (
    <span className="relative block size-12 shrink-0 overflow-clip rounded-[var(--radius-md)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        width={48}
        height={48}
        className="size-full object-cover"
        onError={() => setMissing(true)}
      />
    </span>
  );
}

export function WorkoutSessionScreen() {
  const router = useRouter();
  const session = PREVIEW_WORKOUT;
  const live = useLiveSession();

  function begin() {
    const active = live.status === "active" || live.status === "resting";
    if (
      !active &&
      shouldPromptPreWorkoutCheckin({
        preferenceEnabled: getPreWorkoutCheckinEnabled(),
        alreadyCheckedIn: Boolean(getAthleteStateStore().preWorkout),
        sessionAlreadyActive: false,
      })
    ) {
      router.push("/app/workout/checkin");
      return;
    }
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
            <Link href="/app/plates" aria-label="Calculadora de anilhas" className="text-foreground">
              <FigmaIcon src="/icons/dumbbell.svg" alt="" size={22} />
            </Link>
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-foreground">{session.title}</h1>
            <p className="text-[13px] text-muted">
              {session.programLabel} • {session.estimatedMinutes} min estimados
            </p>
            <WorkoutSyncHint />
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
                  <ExerciseThumb src={exercise.imageSrc ?? "/icons/body-placeholder.svg"} />
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
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2">
                  <p className="min-w-0 text-xs text-muted">
                    Intervalo: {formatRest(exercise.restSeconds)}
                    <span className="mx-2 text-tertiary">|</span>
                    Repetições em reserva: {first?.targetRepsInReserve ?? 2}
                  </p>
                  <div className="flex shrink-0 gap-2">
                    <Link href="/app/exercises" aria-label="Substituir exercício" className="text-muted">
                      <FigmaIcon src="/icons/refresh-cw.svg" alt="" size={16} />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <div className="sticky bottom-0 z-10 bg-background p-6">
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
