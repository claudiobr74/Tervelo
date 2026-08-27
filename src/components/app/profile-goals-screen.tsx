"use client";

import { FieldLabel } from "@/components/auth/auth-shell";
import { ChoiceRow } from "@/components/onboarding/onboarding-shell";
import { ProfileEditShell } from "@/components/app/profile-edit-shell";
import { useOnboardingDraft } from "@/components/onboarding/onboarding-provider";
import type { GoalOption } from "@/lib/auth/onboarding";

const GOALS: { value: GoalOption; label: string }[] = [
  { value: "hypertrophy", label: "Aumento de massa muscular" },
  { value: "fat_loss", label: "Redução de gordura" },
  { value: "recomp", label: "Recomposição corporal" },
  { value: "strength", label: "Aumento de força e potência" },
];

export function ProfileGoalsScreen() {
  const { draft, update } = useOnboardingDraft();

  return (
    <ProfileEditShell title="Objetivos">
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
    </ProfileEditShell>
  );
}
