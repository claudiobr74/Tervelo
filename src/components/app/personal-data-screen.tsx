"use client";

import { AboutYouFields } from "@/components/onboarding/about-you-fields";
import { BodyMeasuresFields } from "@/components/onboarding/body-measures-fields";
import { ProfileEditShell } from "@/components/app/profile-edit-shell";
import { useOnboardingDraft } from "@/components/onboarding/onboarding-provider";

export function PersonalDataScreen() {
  const { draft, update } = useOnboardingDraft();

  return (
    <ProfileEditShell title="Dados pessoais">
      <section className="flex flex-col gap-5">
        <h2 className="text-base font-extrabold text-foreground">Sobre você</h2>
        <AboutYouFields draft={draft} update={update} />
      </section>
      <section className="flex flex-col gap-5">
        <h2 className="text-base font-extrabold text-foreground">Suas medidas</h2>
        <BodyMeasuresFields draft={draft} update={update} />
      </section>
    </ProfileEditShell>
  );
}
