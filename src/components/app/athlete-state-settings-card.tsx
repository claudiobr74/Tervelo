"use client";

import { FigmaIcon } from "@/components/auth/figma-icon";
import { PRODUCT_NAMES } from "@/domain/athlete-state/labels";
import {
  setPreWorkoutCheckinEnabled,
  setWeeklyCoachReviewEnabled,
  usePreWorkoutCheckinEnabled,
  useWeeklyCoachReviewEnabled,
} from "@/lib/athlete-state/preference-store";

export function AthleteStateSettingsCard() {
  const checkin = usePreWorkoutCheckinEnabled();
  const weekly = useWeeklyCoachReviewEnabled();

  return (
    <section className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-4">
      <div>
        <p className="text-xs font-bold uppercase text-brand">FIGMA_UI_PENDING</p>
        <h2 className="text-base font-bold text-foreground">Acompanhamento do Coach</h2>
      </div>
      <ToggleRow
        title={PRODUCT_NAMES.preWorkoutCheckin}
        description="Responda rapidamente como você está antes das sessões para ajudar o Coach a contextualizar seu treino."
        checked={checkin}
        onChange={setPreWorkoutCheckinEnabled}
        label={`Ativar ${PRODUCT_NAMES.preWorkoutCheckin}`}
      />
      <ToggleRow
        title={PRODUCT_NAMES.weeklyCoachReview}
        description="Receba uma análise integrada da sua evolução e saiba se o planejamento deve ser mantido ou ajustado."
        checked={weekly}
        onChange={setWeeklyCoachReviewEnabled}
        label={`Ativar ${PRODUCT_NAMES.weeklyCoachReview}`}
      />
      <p className="flex items-start gap-2 text-xs text-muted">
        <FigmaIcon src="/icons/check.svg" alt="" size={14} className="mt-0.5 text-success" />
        Ambos nascem ligados. Você pode desativar a qualquer momento.
      </p>
    </section>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
  label,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-t border-border pt-3">
      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-sm font-bold text-foreground">{title}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? "bg-brand" : "bg-surface-interactive"}`}
      >
        <span
          className={`absolute top-0.5 size-6 rounded-full bg-background transition-transform ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
