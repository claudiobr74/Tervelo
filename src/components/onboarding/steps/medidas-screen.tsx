"use client";

import { useRouter } from "next/navigation";
import { BodyMeasuresFields } from "@/components/onboarding/body-measures-fields";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { useOnboarding } from "@/components/onboarding/onboarding-provider";

export function OnboardingMedidasScreen() {
  const router = useRouter();
  const { draft, update } = useOnboarding();

  return (
    <OnboardingShell
      step={2}
      title="Suas medidas"
      backHref="/onboarding/perfil"
      skipHref="/onboarding/experiencia"
      footerNote="Você pode preencher as medidas depois em Mais → Dados pessoais."
      onContinue={() => router.push("/onboarding/experiencia")}
    >
      <BodyMeasuresFields draft={draft} update={update} showSkipHint />
    </OnboardingShell>
  );
}
