"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AthleteAppShell } from "@/components/app/athlete-shell";
import { WorkoutSyncHint } from "@/components/app/sync-status-indicator";
import { EmptyPanel } from "@/components/ui/empty-panel";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { startWorkout } from "@/lib/training/live-session";
import { useAthleteTraining } from "@/lib/training/use-athlete-training";

export function WorkoutSessionScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const training = useAthleteTraining(params.get("session"));
  const workout = training.workout;

  function begin() {
    if (!workout) return;
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
            <Link
              href="/app/plates"
              aria-label="Calculadora de anilhas"
              className="text-foreground"
            >
              <FigmaIcon src="/icons/dumbbell.svg" alt="" size={22} />
            </Link>
          </div>
          {training.loading ? <p className="text-sm text-muted">Consultando o banco…</p> : null}
          {training.error ? (
            <EmptyPanel title="Banco indisponível" body="A sessão só abre treino gravado." />
          ) : null}
          {workout ? (
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold text-foreground">{workout.title}</h1>
              <p className="text-[13px] text-muted">
                {workout.exercises.length} exercícios
                {workout.focus ? ` · ${workout.focus}` : ""}
              </p>
              <WorkoutSyncHint />
            </div>
          ) : !training.loading ? (
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold text-foreground">Nenhum treino prescrito</h1>
              <p className="text-[13px] text-muted">
                Quando houver um plano, a sessão aparece aqui.
              </p>
              <WorkoutSyncHint />
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-4 px-6 pb-6">
          {workout ? (
            <>
              <ul className="flex flex-col gap-2">
                {workout.exercises.map((exercise) => (
                  <li
                    key={exercise.id}
                    className="rounded-[var(--radius-lg)] border border-border bg-surface p-4"
                  >
                    <p className="font-semibold">{exercise.namePt}</p>
                    <p className="text-xs text-muted">
                      {exercise.sets.length} séries · {exercise.restSeconds}s de descanso
                    </p>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={begin}
                className="flex h-[54px] w-full items-center justify-center rounded-[var(--radius-lg)] bg-brand text-base font-bold text-on-brand"
              >
                Começar exercício
              </button>
            </>
          ) : (
            <>
              <Link href="/app/plan" className="text-center text-sm font-semibold text-brand">
                Montar plano
              </Link>
              <Link
                href="/app/today"
                className="flex h-[54px] w-full items-center justify-center rounded-[var(--radius-lg)] border border-border text-base font-bold text-foreground"
              >
                Voltar para hoje
              </Link>
            </>
          )}
        </div>
      </div>
    </AthleteAppShell>
  );
}
