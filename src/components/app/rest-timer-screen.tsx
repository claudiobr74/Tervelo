"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AthleteAppShell } from "@/components/app/athlete-shell";
import { HeartRateWorkoutIndicator } from "@/components/app/heart-rate-indicator";
import { WorkoutSyncHint } from "@/components/app/sync-status-indicator";
import { FigmaIcon } from "@/components/auth/figma-icon";
import {
  remainingSeconds,
} from "@/domain/timer/rest-timer";
import {
  currentExercise,
  currentSet,
  formatKg,
  formatTimer,
  isSessionComplete,
  workingSetOrdinal,
} from "@/domain/training/session";
import {
  adjustTimer,
  beginNextSet,
  deserializeTimer,
  pauseOrResumeTimer,
  restartTimer,
  skipRest,
  tickTimer,
  useLiveSession,
} from "@/lib/training/live-session";
import { PREVIEW_WORKOUT } from "@/lib/training/preview-workout";

export function RestTimerScreen() {
  const router = useRouter();
  const live = useLiveSession();
  const [now, setNow] = useState(() => Date.now());
  const session = PREVIEW_WORKOUT;
  const timer = live.timer ? deserializeTimer(live.timer) : null;
  const remaining = timer ? remainingSeconds(timer, new Date(now)) : 0;
  const duration = timer?.durationSeconds ?? 1;
  const progress = duration > 0 ? remaining / duration : 0;
  const deg = progress * 360;
  const complete = Boolean(timer && (timer.status === "completed" || remaining === 0));

  const running = live.timer?.status === "running";
  const endAt = live.timer?.expectedEndAt ?? null;

  useEffect(() => {
    if (live.status === "completed" || isSessionComplete(session, live.recorded)) {
      router.replace("/app/workout/summary");
      return;
    }
    if (live.status !== "resting") {
      router.replace("/app/workout/exercise");
    }
  }, [live.status, live.recorded, router, session]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const stamp = Date.now();
      setNow(stamp);
      tickTimer(new Date(stamp));
    }, 250);
    return () => window.clearInterval(id);
  }, [running, endAt]);

  const nextSet = useMemo(() => {
    if (isSessionComplete(session, live.recorded)) return null;
    return currentSet(session, live.recorded);
  }, [live.recorded, session]);
  const nextExercise = isSessionComplete(session, live.recorded)
    ? session.exercises.at(-1)
    : currentExercise(session, live.recorded);
  const ordinal = nextExercise && nextSet ? workingSetOrdinal(nextExercise, nextSet) : null;
  const lastExercise = live.recorded.at(-1)
    ? session.exercises.find((item) => item.id === live.recorded.at(-1)?.sessionExerciseId)
    : nextExercise;

  function goNext() {
    const dest = skipRest();
    router.push(dest === "summary" ? "/app/workout/summary" : "/app/workout/exercise");
  }

  function continueSet() {
    const dest = beginNextSet();
    router.push(dest === "summary" ? "/app/workout/summary" : "/app/workout/exercise");
  }

  return (
    <AthleteAppShell hideNav>
      <div className="flex flex-col gap-4 px-6 pb-6 pt-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            aria-label="Voltar"
            onClick={() => router.push("/app/workout/exercise")}
            className="text-foreground"
          >
            <FigmaIcon src="/icons/arrow-left.svg" alt="" size={24} />
          </button>
          <p className="text-sm font-bold uppercase text-brand">TERVELO</p>
          <span className="size-6" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-[22px] font-extrabold text-foreground">Descanso</h1>
          <WorkoutSyncHint />
          <p className="text-sm text-muted">
            {lastExercise?.namePt ?? "Série"} • Série {ordinal ? `${Math.max(1, ordinal.current)} de ${ordinal.total}` : "—"}
          </p>
          <HeartRateWorkoutIndicator compact />
        </div>

        <div className="flex flex-col items-center gap-8 py-4">
          <div
            className="relative flex size-[200px] items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(var(--brand-primary) 0deg ${deg}deg, var(--surface-secondary) ${deg}deg 360deg)`,
            }}
            aria-label={`Restante ${formatTimer(remaining)}`}
          >
            <div className="flex size-[168px] flex-col items-center justify-center gap-1 rounded-full bg-background">
              <p className="text-[42px] font-extrabold tabular-nums text-foreground">{formatTimer(remaining)}</p>
              <p className="text-xs font-bold uppercase text-brand">Restantes</p>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            {([-15, 15, 30] as const).map((delta) => (
              <button
                key={delta}
                type="button"
                onClick={() => adjustTimer(delta)}
                className="rounded-[var(--radius-md)] border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-foreground"
              >
                {delta > 0 ? `+${delta}s` : `${delta}s`}
              </button>
            ))}
          </div>

          <div className="flex w-full flex-col gap-3">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => pauseOrResumeTimer()}
                className="flex flex-1 items-center justify-center rounded-[var(--radius-lg)] border border-border bg-surface py-3 text-[15px] font-bold text-foreground"
              >
                {timer?.status === "paused" ? "Retomar" : "Pausar"}
              </button>
              <button
                type="button"
                onClick={() => restartTimer()}
                className="flex flex-1 items-center justify-center rounded-[var(--radius-lg)] border border-border bg-surface py-3 text-[15px] font-bold text-foreground"
              >
                Reiniciar
              </button>
            </div>
            <button
              type="button"
              onClick={goNext}
              className="flex w-full items-center justify-center rounded-[var(--radius-lg)] bg-brand py-3.5 text-base font-bold text-on-brand"
            >
              Pular descanso
            </button>
          </div>

          {nextSet && ordinal ? (
            <div className="flex w-full items-center gap-2 rounded-[var(--radius-lg)] border border-border bg-surface p-3.5">
              <FigmaIcon src="/icons/chevron-right.svg" alt="" size={16} className="text-muted" />
              <p className="text-[13px] text-muted">
                Próximo:{" "}
                <span className="font-bold text-foreground">
                  Série {ordinal.current} de {ordinal.total}
                </span>
                {` • ${formatKg(nextSet.suggestedWeightKg ?? nextSet.targetWeightKg)} × ${nextSet.targetRepsMin} rep`}
              </p>
            </div>
          ) : null}

          {complete ? (
            <div className="flex w-full flex-col gap-3 rounded-[var(--radius-lg)] border border-brand bg-brand-soft p-4">
              <p className="text-[13px] font-bold uppercase text-brand">Intervalo Concluído</p>
              <p className="text-sm text-foreground">Sua próxima série está pronta.</p>
              <button
                type="button"
                onClick={continueSet}
                className="flex w-full items-center justify-center rounded-[var(--radius-md)] bg-brand px-4 py-2.5 text-sm font-bold text-on-brand"
              >
                Começar próxima série
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </AthleteAppShell>
  );
}
