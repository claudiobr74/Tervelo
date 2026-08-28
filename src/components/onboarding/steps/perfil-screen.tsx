"use client";

import { useRouter } from "next/navigation";
import { AboutYouFields } from "@/components/onboarding/about-you-fields";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { useOnboarding } from "@/components/onboarding/onboarding-provider";

export function OnboardingPerfilScreen() {
  const router = useRouter();
  const { draft, update } = useOnboarding();

  return (
    <OnboardingShell
      step={1}
      title="Sobre você"
      backHref="/login"
      skipHref="/onboarding/medidas"
      footerNote="Você poderá alterar estas informações mais tarde em Mais → Dados pessoais."
      onContinue={() => router.push("/onboarding/medidas")}
    >
      <AboutYouFields draft={draft} update={update} />
    </OnboardingShell>
  );
}
