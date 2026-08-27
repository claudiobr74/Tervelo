"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AUTH_INPUT_CLASS, FieldLabel, PRIMARY_CTA_CLASS } from "@/components/auth/auth-shell";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { ChoiceChip, OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { useOnboarding } from "@/components/onboarding/onboarding-provider";
import { markOnboardingComplete, saveOnboardingProfile } from "@/lib/auth/onboarding-sync";
import type { PeriodOption } from "@/lib/auth/onboarding";

const DIETS = [
  "Sem restrições (Dieta Geral)",
  "Vegetariana",
  "Vegana",
  "Low carb",
];

export default function OnboardingNutricaoPage() {
  const router = useRouter();
  const { draft, update } = useOnboarding();
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function finish() {
    setFinishing(true);
    setError(null);
    update({ completed: true });
    const saved = await saveOnboardingProfile({ ...draft, completed: true });
    if (!saved.ok) {
      setFinishing(false);
      setError("Não foi possível salvar suas respostas. Verifique a conexão e tente de novo.");
      return;
    }
    const marked = await markOnboardingComplete();
    if (!marked) {
      setFinishing(false);
      setError("Não foi possível concluir o cadastro. Tente de novo.");
      return;
    }
    router.push("/app/today");
    router.refresh();
  }

  return (
    <div className="relative">
      <OnboardingShell
        step={5}
        title="Alimentação e rotina"
        backHref="/onboarding/objetivos"
        onContinue={finish}
        continueLabel="Finalizar"
        cta={
          <div className="flex w-full flex-col gap-2">
            {error ? <p className="text-sm text-error">{error}</p> : null}
            <button type="button" onClick={finish} disabled={finishing} className={PRIMARY_CTA_CLASS}>
              {finishing ? "Salvando..." : "Finalizar"}
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-2">
          <FieldLabel>Quantas refeições faz por dia?</FieldLabel>
          <div className="flex gap-2">
            {([3, 4, 5, 6] as const).map((count) => (
              <ChoiceChip
                key={count}
                selected={draft.mealsPerDay === count}
                onClick={() => update({ mealsPerDay: count })}
                className="rounded-[10px] p-3 text-[15px]"
              >
                {count}
              </ChoiceChip>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="diet">Padrão alimentar preferencial</FieldLabel>
          <div className="relative">
            <select
              id="diet"
              value={draft.dietPattern}
              onChange={(event) => update({ dietPattern: event.target.value })}
              className={`${AUTH_INPUT_CLASS} appearance-none pr-10`}
            >
              {DIETS.map((diet) => (
                <option key={diet} value={diet}>
                  {diet}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-muted">
              <FigmaIcon src="/icons/arrow-down.svg" alt="" size={16} />
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-start justify-between">
            <FieldLabel>Meta diária de água</FieldLabel>
            <p className="text-sm font-bold text-brand">
              {draft.waterLiters.toString().replace(".", ",")} Litros / dia
            </p>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            step={0.5}
            value={draft.waterLiters}
            onChange={(event) => update({ waterLiters: Number(event.target.value) })}
            className="w-full accent-brand"
            aria-label="Meta diária de água"
          />
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-foreground">Faz uso de suplementos?</p>
            <ToggleSwitch
              checked={draft.usesSupplements}
              onChange={(next) => update({ usesSupplements: next })}
              label="Faz uso de suplementos?"
            />
          </div>
          {draft.usesSupplements ? (
            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor="supps">Suplementos utilizados</FieldLabel>
              <input
                id="supps"
                value={draft.supplements}
                onChange={(event) => update({ supplements: event.target.value })}
                placeholder="Creatina, Whey Protein"
                className={AUTH_INPUT_CLASS}
              />
            </div>
          ) : null}
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
      </OnboardingShell>
      {finishing ? (
        <div className="fixed inset-0 z-10 flex flex-col items-center justify-center gap-6 bg-background/93 p-6">
          <div className="flex w-full max-w-[390px] flex-col items-center gap-6 text-center">
          <span className="relative inline-block size-20 shrink-0 overflow-clip">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/loading-spinner.svg"
              alt=""
              width={80}
              height={80}
              className="size-full animate-spin object-contain"
            />
          </span>
          <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
            <p className="w-full text-xl font-extrabold text-foreground">Salvando suas respostas...</p>
            <p className="w-full text-sm text-muted">
              Guardando seu perfil, seus objetivos e sua rotina alimentar para montar o acompanhamento.
            </p>
          </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
