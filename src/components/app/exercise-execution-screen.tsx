"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AthleteAppShell } from "@/components/app/athlete-shell";
import { HeartRateWorkoutIndicator } from "@/components/app/heart-rate-indicator";
import { WorkoutSyncHint } from "@/components/app/sync-status-indicator";
import { FigmaIcon } from "@/components/auth/figma-icon";
import {
  currentExercise,
  currentSet,
  dropOrdinal,
  groupPartners,
  hasSessionWork,
  isSessionComplete,
  warmupOrdinal,
  warmupSets,
  workingSetOrdinal,
  workingSets,
  type SessionExercise,
  type SetPrescription,
} from "@/domain/training/session";
import {
  recordCurrentSet,
  setRir,
  stepLoad,
  stepReps,
  useLiveSession,
} from "@/lib/training/live-session";
import { getBoundWorkout } from "@/lib/training/bound-workout";
import { EmptyPanel } from "@/components/ui/empty-panel";
import { SYNC_COPY } from "@/domain/offline";

const RIR_OPTIONS = [0, 1, 2, 3, 4] as const;

function Stepper({
  label,
  value,
  onStep,
}: {
  label: string;
  value: number;
  onStep: (delta: number) => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2 rounded-[var(--radius-xl)] border border-border bg-surface p-4">
      <p className="text-xs font-bold uppercase text-muted">{label}</p>
      <p className="text-5xl font-extrabold text-foreground">{value}</p>
      <div className="flex items-center gap-6 pt-1">
        <button
          type="button"
          aria-label={`Diminuir ${label}`}
          onClick={() => onStep(-1)}
          className="flex size-9 items-center justify-center rounded-full bg-surface-interactive text-xl font-bold text-foreground"
        >
          -
        </button>
        <button
          type="button"
          aria-label={`Aumentar ${label}`}
          onClick={() => onStep(1)}
          className="flex size-9 items-center justify-center rounded-full bg-surface-interactive text-xl font-bold text-foreground"
        >
          +
        </button>
      </div>
    </div>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <button type="button" aria-label="Voltar" onClick={onBack} className="text-foreground">
        <FigmaIcon src="/icons/arrow-left.svg" alt="" size={24} />
      </button>
      <p className="text-sm font-bold uppercase text-brand">{title}</p>
      <span className="size-6" />
    </div>
  );
}

function setRowClass(active: boolean, done: boolean) {
  if (active) return "border border-brand bg-brand-soft text-brand";
  if (done) return "bg-surface text-muted opacity-60";
  return "bg-surface text-muted opacity-60";
}

function WarmupList({
  exercise,
  current,
  recordedIds,
}: {
  exercise: SessionExercise;
  current: SetPrescription;
  recordedIds: Set<string>;
}) {
  const warmups = warmupSets(exercise);
  const firstWorking = workingSets(exercise)[0];
  return (
    <div className="flex flex-col gap-2.5">
      {warmups.map((set, index) => {
        const active = set.id === current.id;
        const ordinal = index + 1;
        return (
          <div
            key={set.id}
            className={`flex items-start justify-between rounded-[var(--radius-md)] p-3 text-sm ${setRowClass(active, recordedIds.has(set.id))}`}
          >
            <p className={active ? "font-bold" : "font-semibold"}>
              Aquecimento {ordinal}
              {active ? " (Foco)" : ""}
            </p>
            <p className={active ? "font-extrabold text-foreground" : "font-bold"}>
              {set.targetWeightKg} kg × {set.targetRepsMin}
            </p>
          </div>
        );
      })}
      <div className="flex items-center gap-2 py-2">
        <span className="h-px flex-1 bg-border" />
        <p className="text-[11px] font-extrabold uppercase text-muted">Séries efetivas</p>
        <span className="h-px flex-1 bg-border" />
      </div>
      {firstWorking ? (
        <div className="flex items-start justify-between rounded-[var(--radius-md)] border border-border bg-surface p-3 text-sm text-foreground">
          <p className="font-semibold">Série 1 de {workingSets(exercise).length}</p>
          <p className="font-bold">
            {firstWorking.suggestedWeightKg} kg × {firstWorking.targetRepsMin}-
            {firstWorking.targetRepsMax}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function DropList({
  exercise,
  current,
  recordedIds,
}: {
  exercise: SessionExercise;
  current: SetPrescription;
  recordedIds: Set<string>;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-[var(--radius-xl)] bg-surface p-4">
      {exercise.sets.map((set, index) => {
        const active = set.id === current.id;
        const done = recordedIds.has(set.id);
        const label =
          set.methodKind === "drop_set"
            ? `Drop ${dropOrdinal(exercise, set).current}`
            : `Série ${index + 1}`;
        return (
          <div
            key={set.id}
            className="flex items-center justify-between border-b border-border py-2 last:border-b-0"
          >
            <div className="flex items-center gap-3">
              <span
                className={`size-2 rounded-full ${
                  done ? "bg-success" : active ? "bg-brand" : "bg-tertiary"
                }`}
              />
              <p
                className={`text-sm ${active ? "font-bold text-brand" : done ? "text-muted" : "text-tertiary"}`}
              >
                {label}
              </p>
            </div>
            <p className={`text-sm font-semibold ${active ? "text-foreground" : "text-muted"}`}>
              {set.targetWeightKg} kg × {set.targetRepsMin}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export function ExerciseExecutionScreen() {
  const router = useRouter();
  const live = useLiveSession();
  const session = getBoundWorkout();
  const idle = live.status === "idle" || !hasSessionWork(session);

  const [recordedFlash, setRecordedFlash] = useState(false);

  useEffect(() => {
    if (idle) return;
    if (live.status === "completed" || isSessionComplete(session, live.recorded)) {
      router.replace("/app/workout/summary");
    }
    if (live.status === "resting") {
      router.replace("/app/workout/rest");
    }
  }, [idle, live.status, live.recorded, router, session]);

  if (idle) {
    return (
      <AthleteAppShell hideNav>
        <div className="flex flex-col gap-4 px-6 pb-6 pt-4">
          <EmptyPanel
            title="Nenhum treino em andamento"
            body="Não há sessão ativa. O app não começa um treino de exemplo sozinho."
          />
          <Link
            href="/app/today"
            className="flex h-12 items-center justify-center rounded-[var(--radius-lg)] border border-border text-sm font-bold text-foreground"
          >
            Voltar para hoje
          </Link>
        </div>
      </AthleteAppShell>
    );
  }

  const exercise = currentExercise(session, live.recorded);
  const set = currentSet(session, live.recorded);
  const recordedIds = new Set(live.recorded.map((row) => row.setId));
  const partners = groupPartners(session, exercise);
  const isWarmup = set.methodKind === "warmup";
  const isDrop = set.methodKind === "drop_set" || exercise.methodKind === "drop_set";
  const isSuper = Boolean(exercise.groupId) && partners.length > 1;
  const working = workingSetOrdinal(exercise, set);
  const warmup = warmupOrdinal(exercise, set);
  const superLetter = partners.findIndex((item) => item.id === exercise.id) === 0 ? "A" : "B";
  const nextPartner = partners.find((item) => item.id !== exercise.id);

  function onRecord() {
    const next = recordCurrentSet();
    setRecordedFlash(true);
    if (next === "rest") router.push("/app/workout/rest");
    else if (next === "summary") router.push("/app/workout/summary");
  }

  const headerTitle = isWarmup ? "Aquecimento" : "Modo de Treino";
  const subtitle = isWarmup
    ? `Aquecimento ${warmup.current} de ${warmup.total}`
    : isSuper
      ? `Série ${working.current} de ${working.total}`
      : `Série ${working.current} de ${working.total}`;

  return (
    <AthleteAppShell hideNav>
      <div className="flex min-h-0 flex-1 flex-col justify-between">
        <div className="flex flex-col gap-5 px-6 pb-4 pt-4">
          <div className="flex flex-col gap-2">
            <Header title={headerTitle} onBack={() => router.push("/app/workout")} />
            <div className="flex flex-col gap-1">
              <h1 className="text-[28px] font-extrabold text-foreground">
                {isSuper ? "Supersérie" : exercise.namePt}
              </h1>
              <p className="text-base font-semibold text-brand">{subtitle}</p>
              <HeartRateWorkoutIndicator />
              <WorkoutSyncHint />
              {recordedFlash ? (
                <p className="text-xs font-semibold text-success" role="status" aria-live="polite">
                  ✓ {SYNC_COPY.setRecorded}
                </p>
              ) : null}
            </div>
          </div>

          {isWarmup ? (
            <WarmupList exercise={exercise} current={set} recordedIds={recordedIds} />
          ) : null}

          {isDrop && !isWarmup ? (
            <>
              <div className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-brand bg-brand-soft p-4">
                <div className="flex items-center gap-2">
                  <FigmaIcon src="/icons/info.svg" alt="" size={16} className="text-brand" />
                  <p className="text-sm font-bold uppercase text-brand">Método: Drop Set</p>
                </div>
                <p className="text-[13px] font-medium text-foreground">
                  Reduza a carga e continue sem descanso.
                </p>
              </div>
              <DropList exercise={exercise} current={set} recordedIds={recordedIds} />
            </>
          ) : null}

          {isSuper && !isWarmup ? (
            <div className="flex gap-3 rounded-[var(--radius-lg)] border border-brand bg-surface p-3">
              <div className="flex flex-col items-center gap-0.5">
                {partners.map((partner, index) => (
                  <div key={partner.id} className="flex flex-col items-center">
                    <span
                      className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${
                        partner.id === exercise.id
                          ? "bg-brand text-on-brand"
                          : "border border-border bg-surface-secondary text-muted"
                      }`}
                    >
                      {index === 0 ? "A" : "B"}
                    </span>
                    {index === 0 ? <span className="h-4 w-px bg-brand" /> : null}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1">
                {partners.map((partner, index) => (
                  <p
                    key={partner.id}
                    className={
                      partner.id === exercise.id
                        ? "text-[15px] font-bold text-foreground"
                        : "text-sm text-muted"
                    }
                  >
                    {index === 0 ? "A" : "B"}: {partner.namePt}
                  </p>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex gap-4">
            <Stepper
              label="Carga (kg)"
              value={live.loadKg}
              onStep={(sign) => stepLoad(sign * exercise.loadStepKg)}
            />
            <Stepper label="Repetições" value={live.reps} onStep={stepReps} />
          </div>

          {isDrop && !isWarmup ? (
            <p className="flex items-center justify-center gap-2 text-[13px] font-semibold text-brand">
              <FigmaIcon src="/icons/clock.svg" alt="" size={14} className="text-brand" />
              Sem descanso entre drops
            </p>
          ) : null}

          {isSuper && !isWarmup && nextPartner ? (
            <div className="flex flex-col items-center gap-2 rounded-[var(--radius-lg)] border border-brand/20 bg-brand-soft p-4">
              <p className="flex items-center gap-1.5 text-sm font-bold text-brand">
                Próximo: {nextPartner.namePt} (sem descanso)
                <FigmaIcon src="/icons/chevron-right.svg" alt="" size={16} className="text-brand" />
              </p>
              <p className="text-center text-xs text-muted">
                O descanso de {exercise.restSeconds}s será iniciado após completar ambos os
                exercícios.
              </p>
            </div>
          ) : null}

          {!isWarmup && !isDrop && !isSuper ? (
            <div className="flex flex-col gap-3.5 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
              <div className="flex flex-col gap-1">
                <p className="text-[13px] font-bold text-foreground">Repetições em reserva (RIR)</p>
                <p className="text-xs text-muted">
                  Quantas repetições você ainda conseguiria realizar mantendo boa técnica?
                </p>
              </div>
              <div className="flex items-center justify-between">
                {RIR_OPTIONS.map((value) => {
                  const selected = live.rir === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRir(value)}
                      className={`flex size-12 items-center justify-center rounded-full text-sm font-bold ${
                        selected
                          ? "bg-brand text-on-brand"
                          : "bg-surface-interactive text-foreground"
                      }`}
                    >
                      {value === 4 ? "4+" : value}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 px-6 pb-6">
          {isWarmup ? (
            <>
              <p className="text-center text-xs text-muted">
                Séries de aquecimento não contam para o volume total do treino.
              </p>
              <button
                type="button"
                onClick={onRecord}
                className="flex h-[54px] w-full items-center justify-center rounded-[var(--radius-lg)] border-2 border-brand text-base font-bold text-brand"
              >
                Registrar aquecimento
              </button>
            </>
          ) : isDrop ? (
            <>
              <button
                type="button"
                onClick={onRecord}
                className="flex w-full items-center justify-center rounded-[14px] bg-brand p-[18px] text-base font-bold text-on-brand"
              >
                Registrar drop
              </button>
              <div className="flex items-center justify-between rounded-[var(--radius-lg)] bg-surface-secondary p-4">
                <p className="text-sm font-semibold text-muted">Próximo descanso:</p>
                <span className="rounded-md bg-surface-interactive px-3 py-1.5 text-sm font-bold text-brand">
                  Descanso {String(Math.floor(exercise.restSeconds / 60)).padStart(2, "0")}:
                  {String(exercise.restSeconds % 60).padStart(2, "0")}
                </span>
              </div>
            </>
          ) : isSuper ? (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={onRecord}
                className="flex h-12 w-full items-center justify-center rounded-[var(--radius-lg)] bg-brand text-[15px] font-bold text-on-brand"
              >
                Registrar {superLetter}
              </button>
              <div className="flex gap-3">
                <Link
                  href="/app/workout"
                  className="flex h-12 flex-1 items-center justify-center rounded-[var(--radius-lg)] border border-border bg-surface text-[15px] font-bold text-muted"
                >
                  Anterior
                </Link>
                <button
                  type="button"
                  onClick={onRecord}
                  className="flex h-12 flex-1 items-center justify-center rounded-[var(--radius-lg)] border border-border bg-surface text-[15px] font-bold text-muted"
                >
                  Pular
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={onRecord}
              className="flex h-[54px] w-full items-center justify-center rounded-[var(--radius-lg)] bg-brand text-base font-bold text-on-brand"
            >
              Registrar série
            </button>
          )}
        </div>
      </div>
    </AthleteAppShell>
  );
}
