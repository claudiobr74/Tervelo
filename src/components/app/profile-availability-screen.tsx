"use client";

import { FieldLabel } from "@/components/auth/auth-shell";
import { ChoiceChip } from "@/components/onboarding/onboarding-shell";
import { ProfileEditShell } from "@/components/app/profile-edit-shell";
import { useOnboardingDraft } from "@/components/onboarding/onboarding-provider";
import type { PeriodOption, Weekday } from "@/lib/auth/onboarding";

const DAYS: { value: Weekday; label: string }[] = [
  { value: "seg", label: "Seg" },
  { value: "ter", label: "Ter" },
  { value: "qua", label: "Qua" },
  { value: "qui", label: "Qui" },
  { value: "sex", label: "Sex" },
  { value: "sab", label: "Sáb" },
  { value: "dom", label: "Dom" },
];

export function ProfileAvailabilityScreen() {
  const { draft, update } = useOnboardingDraft();

  function toggleDay(day: Weekday) {
    const next = draft.days.includes(day)
      ? draft.days.filter((item) => item !== day)
      : [...draft.days, day];
    update({ days: next });
  }

  return (
    <ProfileEditShell title="Disponibilidade">
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
                  selected ? "border-brand bg-brand text-on-brand" : "border-border bg-surface text-muted"
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
      <div className="flex flex-col gap-2">
        <FieldLabel>Período preferido para treinar</FieldLabel>
        <div className="flex gap-2">
          {(
            [
              ["morning", "Manhã"],
              ["afternoon", "Tarde"],
              ["evening", "Noite"],
            ] as const
          ).map(([value, label]) => (
            <ChoiceChip
              key={value}
              selected={draft.preferredPeriod === value}
              onClick={() => update({ preferredPeriod: value as PeriodOption })}
              className="rounded-[10px] p-3"
            >
              {label}
            </ChoiceChip>
          ))}
        </div>
      </div>
    </ProfileEditShell>
  );
}
