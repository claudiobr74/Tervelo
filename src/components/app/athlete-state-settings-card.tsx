"use client";

import { FigmaIcon } from "@/components/auth/figma-icon";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
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
      <h2 className="text-base font-bold text-foreground">Acompanhamento do Coach</h2>
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
    <div className="flex flex-col gap-1 border-t border-border pt-3">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 text-sm font-bold text-foreground">{title}</p>
        <ToggleSwitch checked={checked} onChange={onChange} label={label} />
      </div>
      <p className="text-xs text-muted">{description}</p>
    </div>
  );
}
