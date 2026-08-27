"use client";

import { AUTH_INPUT_CLASS, FieldLabel } from "@/components/auth/auth-shell";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { MeasurementPointsGuide } from "@/components/onboarding/measurement-points-guide";
import type { OnboardingDraft } from "@/lib/auth/onboarding";

function Measure({
  id,
  label,
  value,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input
        id={id}
        inputMode="decimal"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={AUTH_INPUT_CLASS}
      />
    </div>
  );
}

export function BodyMeasuresFields({
  draft,
  update,
  showSkipHint = false,
}: {
  draft: OnboardingDraft;
  update: (patch: Partial<OnboardingDraft>) => void;
  showSkipHint?: boolean;
}) {
  return (
    <>
      {showSkipHint ? (
        <div className="flex gap-2.5 rounded-[var(--radius-lg)] border border-brand bg-brand-soft p-3 text-brand">
          <FigmaIcon src="/icons/info.svg" alt="" size={18} />
          <p className="flex-1 text-[13px] leading-[18px] text-brand">
            Opcional — você pode pular e preencher depois caso não saiba suas medidas de cabeça.
          </p>
        </div>
      ) : null}
      <div className="flex items-center gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <Measure
            id="chest"
            label="Tórax (cm)"
            value={draft.chestCm}
            placeholder="104 cm"
            onChange={(chestCm) => update({ chestCm })}
          />
          <Measure
            id="waist"
            label="Cintura (cm)"
            value={draft.waistCm}
            placeholder="84 cm"
            onChange={(waistCm) => update({ waistCm })}
          />
          <Measure
            id="hip"
            label="Quadril (cm)"
            value={draft.hipCm}
            placeholder="Ex: 94"
            onChange={(hipCm) => update({ hipCm })}
          />
          <Measure
            id="rarm"
            label="Braço Dir. (cm)"
            value={draft.rightArmCm}
            placeholder="39 cm"
            onChange={(rightArmCm) => update({ rightArmCm })}
          />
          <Measure
            id="larm"
            label="Braço Esq. (cm)"
            value={draft.leftArmCm}
            placeholder="38.5 cm"
            onChange={(leftArmCm) => update({ leftArmCm })}
          />
        </div>
        <MeasurementPointsGuide />
      </div>
      <div className="flex gap-3">
        <div className="min-w-0 flex-1">
          <Measure
            id="rthigh"
            label="Coxa Dir. (cm)"
            value={draft.rightThighCm}
            placeholder="Ex: 58"
            onChange={(rightThighCm) => update({ rightThighCm })}
          />
        </div>
        <div className="min-w-0 flex-1">
          <Measure
            id="lthigh"
            label="Coxa Esq. (cm)"
            value={draft.leftThighCm}
            placeholder="Ex: 58"
            onChange={(leftThighCm) => update({ leftThighCm })}
          />
        </div>
      </div>
    </>
  );
}
