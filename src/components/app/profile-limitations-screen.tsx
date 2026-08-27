"use client";

import { FieldLabel } from "@/components/auth/auth-shell";
import { ProfileEditShell } from "@/components/app/profile-edit-shell";
import { useOnboardingDraft } from "@/components/onboarding/onboarding-provider";

export function ProfileLimitationsScreen() {
  const { draft, update } = useOnboardingDraft();

  return (
    <ProfileEditShell title="Limitações">
      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="limits">Limitações ou lesões</FieldLabel>
        <textarea
          id="limits"
          value={draft.limitations}
          onChange={(event) => update({ limitations: event.target.value })}
          placeholder="Ex: Desconforto leve no ombro esquerdo ao supinar..."
          className="h-[120px] w-full resize-none rounded-[var(--radius-lg)] border border-border bg-surface p-3.5 text-sm text-foreground placeholder:text-tertiary outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand"
        />
      </div>
    </ProfileEditShell>
  );
}
