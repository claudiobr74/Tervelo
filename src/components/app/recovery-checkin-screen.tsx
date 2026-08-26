"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AthleteAppShell } from "@/components/app/athlete-shell";
import { FigmaIcon } from "@/components/auth/figma-icon";
import {
  DEFAULT_RECOVERY_SLIDERS,
  RECOVERY_QUESTIONS,
  classifyRecovery,
  recoveryResultCopy,
  scoresFromSliders,
  sliderLabel,
  type RecoverySliderKey,
  type RecoverySliders,
} from "@/domain/recovery/score";
import { appendRecoveryCheckin } from "@/lib/longitudinal/preview-store";

function SliderField({
  question,
  value,
  label,
  onChange,
}: {
  question: string;
  value: number;
  label: string;
  onChange: (value: number) => void;
}) {
  const fill = ((value - 1) / 4) * 100;
  return (
    <article className="flex flex-col gap-2.5 rounded-[var(--radius-lg)] border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 flex-1 truncate text-[13px] font-semibold text-foreground">{question}</p>
        <p className="shrink-0 text-xs font-bold text-brand">{label}</p>
      </div>
      <div className="relative flex h-4 items-center">
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-border" />
        <div className="absolute left-0 h-1.5 rounded-full bg-brand" style={{ width: `${fill}%` }} />
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={value}
          aria-label={question}
          aria-valuemin={1}
          aria-valuemax={5}
          aria-valuenow={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="recovery-slider relative z-10 w-full cursor-pointer"
        />
      </div>
    </article>
  );
}

export function RecoveryCheckinScreen() {
  const router = useRouter();
  const [sliders, setSliders] = useState<RecoverySliders>(DEFAULT_RECOVERY_SLIDERS);
  const [saving, setSaving] = useState(false);
  const scores = scoresFromSliders(sliders);
  const classification = classifyRecovery(scores.perceivedRecovery);

  function setSlider(key: RecoverySliderKey, value: number) {
    setSliders((current) => ({ ...current, [key]: value }));
  }

  function leave() {
    router.push("/app/today");
  }

  async function confirm() {
    if (saving) return;
    setSaving(true);
    await appendRecoveryCheckin(scores);
    router.push("/app/today");
  }

  return (
    <AthleteAppShell active="Hoje">
      <div className="flex flex-col gap-5 px-6 pb-6 pt-4">
        <header className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <button type="button" onClick={leave} aria-label="Fechar" className="text-foreground">
              <FigmaIcon src="/icons/close.svg" alt="" size={24} />
            </button>
            <p className="text-base font-semibold text-foreground">Check-in de Recuperação</p>
            <button type="button" onClick={leave} className="text-sm font-semibold text-brand">
              Pular
            </button>
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-foreground">Como você está se sentindo?</h1>
            <p className="text-[13px] text-muted">
              Check-in diário rápido de recuperação (menos de 30 segundos)
            </p>
          </div>
        </header>

        <div className="flex flex-col gap-5">
          {RECOVERY_QUESTIONS.map((item) => (
            <SliderField
              key={item.key}
              question={item.question}
              value={sliders[item.key]}
              label={sliderLabel(item.key, sliders[item.key])}
              onChange={(value) => setSlider(item.key, value)}
            />
          ))}

          <article className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-success bg-success/20 p-4">
            <FigmaIcon src="/icons/check-circle.svg" alt="" size={20} className="text-success" />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="text-sm font-bold text-foreground">Recuperação de hoje: {classification}</p>
              <p className="text-xs text-foreground/80">{recoveryResultCopy(scores.perceivedRecovery)}</p>
            </div>
          </article>

          <button
            type="button"
            onClick={confirm}
            disabled={saving}
            className="flex h-[54px] w-full items-center justify-center rounded-[var(--radius-lg)] bg-brand text-base font-bold text-on-brand disabled:opacity-70"
          >
            Confirmar check-in
          </button>
        </div>
      </div>
    </AthleteAppShell>
  );
}
