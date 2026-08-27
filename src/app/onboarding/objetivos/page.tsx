"use client";

import { useRouter } from "next/navigation";
import { FieldLabel } from "@/components/auth/auth-shell";
import { ChoiceRow, OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { useOnboarding } from "@/components/onboarding/onboarding-provider";
import type { GoalOption, Weekday } from "@/lib/auth/onboarding";

const GOALS: { value: GoalOption; label: string }[] = [
  { value: "hypertrophy", label: "Aumento de massa muscular" },
  { value: "fat_loss", label: "Redução de gordura" },
  { value: "recomp", label: "Recomposição corporal" },
  { value: "strength", label: "Aumento de força e potência" },
];

const DAYS: { value: Weekday; label: string }[] = [
  { value: "seg", label: "Seg" },
  { value: "ter", label: "Ter" },
  { value: "qua", label: "Qua" },
  { value: "qui", label: "Qui" },
  { value: "sex", label: "Sex" },
  { value: "sab", label: "Sáb" },
  { value: "dom", label: "Dom" },
];

export default function OnboardingObjetivosPage() {
  const router = useRouter();
  const { draft, update } = useOnboarding();

  function toggleDay(day: Weekday) {
    const next = draft.days.includes(day)
      ? draft.days.filter((item) => item !== day)
      : [...draft.days, day];
    update({ days: next });
  }

  return (
    <OnboardingShell
      step={4}
      title="Seus objetivos"
      backHref="/onboarding/experiencia"
      onContinue={() => router.push("/onboarding/nutricao")}
    >
      <div className="flex flex-col gap-2">
        <FieldLabel>Qual o seu objetivo principal?</FieldLabel>
        <div className="flex flex-col gap-2">
          {GOALS.map((item) => (
            <ChoiceRow
              key={item.value}
              selected={draft.goal === item.value}
              onClick={() => update({ goal: item.value })}
            >
              {item.label}
            </ChoiceRow>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <FieldLabel>Quais dias tem disponível para treinar?</FieldLabel>
        <div className="flex gap-1.5">
          {DAYS.map((day) => {
            const selected = draft.days.includes(day.value);
            return (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={`flex flex-1 items-center justify-center rounded-[var(--radius-md)] border px-2 py-2.5 text-[12px] font-bold ${
                  selected
                    ? "border-brand bg-brand text-on-brand"
                    : "border-border bg-surface text-muted"
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-3 pt-2">
        <div className="flex items-start justify-between">
          <FieldLabel>Tempo máximo por treino</FieldLabel>
          <p className="text-sm font-bold text-brand">{draft.sessionMinutes} minutos</p>
        </div>
        <input
          type="range"
          min={30}
          max={120}
          step={5}
          value={draft.sessionMinutes}
          onChange={(event) => update({ sessionMinutes: Number(event.target.value) })}
          className="w-full accent-brand"
          aria-label="Tempo máximo por treino"
        />
        <div className="flex justify-between text-[11px] text-tertiary">
          <span>30 min</span>
          <span>120 min</span>
        </div>
      </div>
    </OnboardingShell>
  );
}
