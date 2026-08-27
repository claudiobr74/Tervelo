"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AthleteAppShell } from "@/components/app/athlete-shell";
import { ChoiceGroup } from "@/components/app/choice-group";
import { WorkoutSyncHint } from "@/components/app/sync-status-indicator";
import { FigmaIcon } from "@/components/auth/figma-icon";
import {
  BLOCKS_EXERCISE_OPTIONS,
  BODY_REGIONS,
  ENERGY_OPTIONS,
  MUSCLE_RECOVERY_OPTIONS,
  PAIN_INTENSITY_OPTIONS,
  SLEEP_OPTIONS,
  STRESS_OPTIONS,
  YES_NO,
  safetyFromPain,
  skippedPreWorkoutCheckin,
  type PreWorkoutCheckin,
} from "@/domain/athlete-state/pre-workout";
import { adaptSessionForAvailableTime, exercisesFromSession } from "@/domain/athlete-state/session-adaptation";
import { PRODUCT_NAMES } from "@/domain/athlete-state/labels";
import { savePreWorkoutCheckin, setTodayAdjustment, trackProductEvent } from "@/lib/athlete-state/session-store";
import { startWorkout } from "@/lib/training/live-session";
import { PREVIEW_WORKOUT } from "@/lib/training/preview-workout";

const TIME_CHIPS = [30, 40, 45, 60] as const;

export function PreWorkoutCheckinScreen() {
  const router = useRouter();
  const [step, setStep] = useState<"main" | "pain">("main");
  const [sleep, setSleep] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [muscle, setMuscle] = useState<number | null>(null);
  const [stress, setStress] = useState<number | null>(null);
  const [pain, setPain] = useState<boolean | null>(null);
  const [plannedTime, setPlannedTime] = useState<boolean | null>(null);
  const [minutes, setMinutes] = useState(45);
  const [region, setRegion] = useState<string | null>(null);
  const [intensity, setIntensity] = useState<"leve" | "moderada" | "forte" | null>(null);
  const [worsens, setWorsens] = useState<boolean | null>(null);
  const [blocks, setBlocks] = useState<"nao" | "sim" | "nao_sei" | null>(null);
  const [saving, setSaving] = useState(false);

  function goToWorkout() {
    startWorkout();
    router.replace("/app/workout");
  }

  async function skip() {
    if (saving) return;
    setSaving(true);
    await savePreWorkoutCheckin(skippedPreWorkoutCheckin());
    trackProductEvent("checkin_pre_treino_pulado");
    goToWorkout();
  }

  function buildCheckin(): PreWorkoutCheckin {
    return {
      status: "completed",
      sleepQuality: sleep,
      energy,
      muscleRecovery: muscle,
      stress,
      hasPain: pain,
      painRegion: pain ? region : null,
      painIntensity: pain ? intensity : null,
      painWorsensWithMovement: pain ? worsens : null,
      painBlocksPlannedExercise: pain ? blocks : null,
      hasPlannedTime: plannedTime,
      availableMinutes: plannedTime === false ? minutes : null,
    };
  }

  async function start() {
    if (saving) return;
    if (pain === true && step === "main") {
      setStep("pain");
      return;
    }
    setSaving(true);
    const checkin = buildCheckin();
    await savePreWorkoutCheckin(checkin);
    trackProductEvent("checkin_pre_treino_concluido");

    const safety = safetyFromPain(checkin);
    if (plannedTime === false) {
      const adapted = adaptSessionForAvailableTime({
        plannedMinutes: PREVIEW_WORKOUT.estimatedMinutes,
        availableMinutes: minutes,
        exercises: exercisesFromSession(PREVIEW_WORKOUT),
      });
      setTodayAdjustment({
        whatChanged: adapted.dropped.length
          ? `Priorizamos os exercícios principais e retiramos ${adapted.dropped.map((item) => item.name).join(", ")}.`
          : "A sessão de hoje foi enxugada para caber no tempo informado.",
        whyChanged: `Você tem cerca de ${minutes} minutos, abaixo dos ${PREVIEW_WORKOUT.estimatedMinutes} planejados.`,
        dataConsidered: "Tempo disponível informado no Check-in Pré-Treino. O programa futuro permanece igual.",
        onlyToday: true,
        reevaluateWhen: "Na próxima sessão, ou na Revisão Semanal do Coach.",
      });
    } else if (safety.activateRecoveryAndSafety) {
      setTodayAdjustment({
        whatChanged: safety.copy ?? "A sessão de hoje considera a limitação informada.",
        whyChanged: "Há dor ou limitação hoje. A segurança vem antes da performance.",
        dataConsidered: "Check-in Pré-Treino e módulo de Recuperação e Segurança. Sem diagnóstico.",
        onlyToday: true,
        reevaluateWhen: "Ao final desta sessão e na Revisão Semanal do Coach.",
      });
    } else {
      setTodayAdjustment(null);
    }
    goToWorkout();
  }

  const ready =
    sleep != null && energy != null && muscle != null && stress != null && pain != null && plannedTime != null;

  return (
    <AthleteAppShell active="Treino" hideNav>
      <div className="flex flex-col gap-5 px-6 pb-8 pt-4">
        <header className="flex items-center justify-between">
          <button type="button" onClick={() => router.push("/app/today")} aria-label="Voltar" className="text-foreground">
            <FigmaIcon src="/icons/arrow-left.svg" alt="" size={24} />
          </button>
          <p className="text-sm font-semibold text-foreground">{PRODUCT_NAMES.preWorkoutCheckin}</p>
          <button type="button" onClick={() => void skip()} className="text-sm font-semibold text-brand">
            Pular por hoje
          </button>
        </header>

        <div>
          <h1 className="text-xl font-bold text-foreground">Como você está para treinar hoje?</h1>
          <p className="mt-1 text-[13px] text-muted">Resposta rápida, com uma mão. 15 a 30 segundos.</p>
          <WorkoutSyncHint />
        </div>

        {step === "main" ? (
          <div className="flex flex-col gap-5">
            <ChoiceGroup legend="Como foi seu sono?" options={SLEEP_OPTIONS} value={sleep} onChange={setSleep} />
            <ChoiceGroup legend="Como está sua energia agora?" options={ENERGY_OPTIONS} value={energy} onChange={setEnergy} />
            <ChoiceGroup
              legend="Como seu corpo está para treinar?"
              options={MUSCLE_RECOVERY_OPTIONS}
              value={muscle}
              onChange={setMuscle}
            />
            <ChoiceGroup legend="Como está seu nível de estresse hoje?" options={STRESS_OPTIONS} value={stress} onChange={setStress} />
            <ChoiceGroup legend="Alguma dor ou limitação hoje?" options={YES_NO} value={pain} onChange={setPain} columns={2} />
            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-bold text-foreground">Você tem o tempo planejado para o treino?</legend>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  aria-pressed={plannedTime === true}
                  onClick={() => setPlannedTime(true)}
                  className={`flex min-h-12 items-center justify-center rounded-[var(--radius-lg)] border text-sm font-semibold ${
                    plannedTime === true ? "border-brand bg-brand-soft text-brand" : "border-border bg-surface text-foreground"
                  }`}
                >
                  Sim
                </button>
                <button
                  type="button"
                  aria-pressed={plannedTime === false}
                  onClick={() => setPlannedTime(false)}
                  className={`flex min-h-12 items-center justify-center rounded-[var(--radius-lg)] border text-sm font-semibold ${
                    plannedTime === false ? "border-brand bg-brand-soft text-brand" : "border-border bg-surface text-foreground"
                  }`}
                >
                  Tenho aproximadamente {minutes} minutos
                </button>
              </div>
              {plannedTime === false ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {TIME_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setMinutes(chip)}
                      className={`min-h-11 min-w-14 rounded-[var(--radius-md)] border px-3 text-sm font-semibold ${
                        minutes === chip ? "border-brand bg-brand-soft text-brand" : "border-border bg-surface text-foreground"
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                  <div className="flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface px-2">
                    <button type="button" aria-label="Diminuir minutos" onClick={() => setMinutes((value) => Math.max(15, value - 5))}>
                      −
                    </button>
                    <span className="min-w-8 text-center text-sm font-bold tabular-nums">{minutes}</span>
                    <button type="button" aria-label="Aumentar minutos" onClick={() => setMinutes((value) => Math.min(180, value + 5))}>
                      +
                    </button>
                  </div>
                </div>
              ) : null}
            </fieldset>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <p className="text-sm text-muted">Não diagnosticamos lesão. Só precisamos saber o que evitar hoje.</p>
            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-bold text-foreground">Onde?</legend>
              <div className="grid grid-cols-2 gap-2">
                {BODY_REGIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={region === item}
                    onClick={() => setRegion(item)}
                    className={`flex min-h-11 items-center justify-center rounded-[var(--radius-lg)] border px-2 text-xs font-semibold ${
                      region === item ? "border-brand bg-brand-soft text-brand" : "border-border bg-surface text-foreground"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </fieldset>
            <ChoiceGroup legend="Intensidade" options={PAIN_INTENSITY_OPTIONS} value={intensity} onChange={setIntensity} />
            <ChoiceGroup legend="Algum movimento piora?" options={YES_NO} value={worsens} onChange={setWorsens} columns={2} />
            <ChoiceGroup
              legend="Isso impede algum exercício planejado?"
              options={BLOCKS_EXERCISE_OPTIONS}
              value={blocks}
              onChange={setBlocks}
            />
          </div>
        )}

        <button
          type="button"
          disabled={saving || (step === "main" && !ready)}
          onClick={() => void start()}
          className="flex h-[54px] w-full items-center justify-center rounded-[var(--radius-lg)] bg-brand text-base font-bold text-on-brand disabled:opacity-50"
        >
          Começar treino
        </button>
      </div>
    </AthleteAppShell>
  );
}
