"use client";

import { useRouter } from "next/navigation";
import { FieldLabel } from "@/components/auth/auth-shell";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { ChoiceRow, OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { useOnboarding } from "@/components/onboarding/onboarding-provider";
import type { ExperienceOption } from "@/lib/auth/onboarding";

const EXPERIENCE: { value: ExperienceOption; label: string }[] = [
  { value: "lt6m", label: "Menos de 6 meses" },
  { value: "6m-2y", label: "6 meses a 2 anos" },
  { value: "2-5y", label: "2 a 5 anos" },
  { value: "gt5y", label: "Mais de 5 anos" },
];

export default function OnboardingExperienciaPage() {
  const router = useRouter();
  const { draft, update } = useOnboarding();

  return (
    <OnboardingShell
      step={3}
      title="Sua experiência"
      backHref="/onboarding/medidas"
      onContinue={() => router.push("/onboarding/objetivos")}
    >
      <div className="flex flex-col gap-2">
        <FieldLabel>Há quanto tempo pratica musculação?</FieldLabel>
        <div className="flex flex-col gap-2">
          {EXPERIENCE.map((item) => (
            <ChoiceRow
              key={item.value}
              selected={draft.experience === item.value}
              onClick={() => update({ experience: item.value })}
            >
              {item.label}
            </ChoiceRow>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        <FieldLabel>Ambientes de treino confortáveis</FieldLabel>
        {(
          [
            ["comfortableFreeWeights", "Sinto-me confortável com pesos livres"],
            ["comfortableMachines", "Sinto-me confortável com máquinas"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => update({ [key]: !draft[key] })}
            className="flex w-full items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-3.5"
          >
            <span
              className={`flex size-5 items-center justify-center rounded-[var(--radius-sm)] ${
                draft[key] ? "bg-brand" : "border border-border bg-surface"
              }`}
            >
              {draft[key] ? <FigmaIcon src="/icons/check.svg" alt="" size={12} /> : null}
            </span>
            <span className="flex-1 text-left text-sm font-semibold text-foreground">{label}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="limits">Limitações ou lesões</FieldLabel>
        <textarea
          id="limits"
          value={draft.limitations}
          onChange={(event) => update({ limitations: event.target.value })}
          placeholder="Ex: Desconforto leve no ombro esquerdo ao supinar..."
          className="h-[70px] w-full resize-none rounded-[var(--radius-lg)] border border-border bg-surface p-3.5 text-sm text-foreground placeholder:text-tertiary outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand"
        />
      </div>
    </OnboardingShell>
  );
}
