"use client";

import { AUTH_INPUT_CLASS, FieldLabel } from "@/components/auth/auth-shell";
import { ChoiceChip } from "@/components/onboarding/onboarding-shell";
import { ageYearsFromBirthDate } from "@/domain/athlete/age";
import type { OnboardingDraft, SexOption } from "@/lib/auth/onboarding";

function ageHint(iso: string): string {
  const result = ageYearsFromBirthDate(iso, new Date());
  if (!result.ok) return "";
  return ` (${result.value} anos)`;
}

export function AboutYouFields({
  draft,
  update,
}: {
  draft: OnboardingDraft;
  update: (patch: Partial<OnboardingDraft>) => void;
}) {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="preferred-name">Nome preferido</FieldLabel>
        <input
          id="preferred-name"
          value={draft.displayName}
          onChange={(event) => update({ displayName: event.target.value })}
          className={AUTH_INPUT_CLASS}
          placeholder="Seu nome"
        />
      </div>
      <div className="flex flex-col gap-2">
        <FieldLabel>Sexo Biológico</FieldLabel>
        <div className="flex gap-2.5">
          {(
            [
              ["male", "Masculino"],
              ["female", "Feminino"],
              ["other", "Outro"],
            ] as const
          ).map(([value, label]) => (
            <ChoiceChip
              key={value}
              selected={draft.sex === value}
              onClick={() => update({ sex: value as SexOption })}
            >
              {label}
            </ChoiceChip>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="birth">Data de nascimento</FieldLabel>
        <input
          id="birth"
          type="date"
          value={draft.birthDate}
          onChange={(event) => update({ birthDate: event.target.value })}
          className={AUTH_INPUT_CLASS}
        />
        {draft.birthDate ? (
          <p className="text-sm text-muted">{ageHint(draft.birthDate).trim()}</p>
        ) : null}
      </div>
      <div className="flex gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <FieldLabel htmlFor="height">Altura (cm)</FieldLabel>
          <input
            id="height"
            inputMode="decimal"
            value={draft.heightCm}
            onChange={(event) => update({ heightCm: event.target.value })}
            placeholder="180 cm"
            className={AUTH_INPUT_CLASS}
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <FieldLabel htmlFor="weight">Peso atual (kg)</FieldLabel>
          <input
            id="weight"
            inputMode="decimal"
            value={draft.weightKg}
            onChange={(event) => update({ weightKg: event.target.value })}
            placeholder="82,4 kg"
            className={AUTH_INPUT_CLASS}
          />
        </div>
      </div>
    </>
  );
}
