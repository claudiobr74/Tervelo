"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AthleteAppShell } from "@/components/app/athlete-shell";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { percentChange } from "@/domain/progress/change";
import {
  PREVIEW_BENCH_BARS,
  PREVIEW_BENCH_LABELS,
  PREVIEW_CONSISTENCY_PERCENT,
  PREVIEW_STRENGTH_LIFTS,
  PREVIEW_VOLUME_BARS,
} from "@/lib/longitudinal/preview-progress";
import { formatMeasure, formatPercent } from "@/lib/longitudinal/format";

const TABS = ["Força", "Visão Geral", "Volume", "Exercícios", "Medidas"] as const;
type ProgressTab = (typeof TABS)[number];

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-[var(--radius-md)] px-3 py-2 text-[11px] font-bold ${
        active ? "bg-brand text-on-brand" : "border border-border bg-surface text-muted"
      }`}
    >
      {label}
    </button>
  );
}

function LiftCard({ name, currentKg, previousKg, weeks }: (typeof PREVIEW_STRENGTH_LIFTS)[number]) {
  const change = percentChange(currentKg, previousKg);
  return (
    <article className="flex min-w-0 flex-1 flex-col gap-2 rounded-[var(--radius-xl)] border border-border bg-surface p-4">
      <p className="text-[11px] font-medium text-muted">{name}</p>
      <p className="text-xl font-bold text-foreground">{formatMeasure(currentKg, "kg", 0)}</p>
      {change !== null ? (
        <div className="flex items-center gap-1">
          <FigmaIcon src="/icons/trending-up.svg" alt="" size={12} className="text-success" />
          <p className="text-[11px] font-bold text-success">
            +{Math.round(change)}% em {weeks} sem
          </p>
        </div>
      ) : null}
    </article>
  );
}

function StrengthChart() {
  return (
    <article className="flex flex-col gap-3 rounded-[var(--radius-xl)] border border-border bg-surface p-4">
      <div className="flex flex-col gap-1">
        <p className="text-base font-bold text-foreground">Progressão no Supino Reto</p>
        <p className="text-[11px] font-medium text-muted">Últimos 3 meses</p>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex h-20 items-end justify-between">
          {PREVIEW_BENCH_BARS.map((bar, index) => (
            <span
              key={bar.kg}
              title={`${bar.kg} kg`}
              className={`w-8 rounded-[4px] ${index >= 3 ? "bg-brand" : "bg-surface-pressed"}`}
              style={{ height: bar.height }}
            />
          ))}
        </div>
        <div className="flex items-start justify-between text-[11px] font-medium">
          {PREVIEW_BENCH_LABELS.map((item) => (
            <p key={item.label} className={item.accent ? "text-brand" : "text-tertiary"}>
              {item.label}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}

function VolumeChart() {
  return (
    <article className="flex flex-col gap-3 rounded-[var(--radius-xl)] border border-border bg-surface p-4">
      <div className="flex flex-col gap-1">
        <p className="text-base font-bold text-foreground">Volume de carga</p>
        <p className="text-[11px] font-medium text-muted">Últimos 3 meses</p>
      </div>
      <div className="flex h-20 items-end justify-between">
        {PREVIEW_VOLUME_BARS.map((height, index) => (
          <span
            key={height}
            className={`w-8 rounded-[4px] ${index >= 3 ? "bg-brand" : "bg-surface-pressed"}`}
            style={{ height }}
          />
        ))}
      </div>
    </article>
  );
}

function ConsistencyCard() {
  return (
    <article className="flex flex-col gap-2.5 rounded-[var(--radius-xl)] border border-border bg-surface p-4">
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-medium text-muted">Consistência nos Treinos</p>
        <p className="text-sm font-bold text-success">
          {formatPercent(PREVIEW_CONSISTENCY_PERCENT, 0)} de aderência
        </p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-pressed">
        <div
          className="h-2 rounded-full bg-success"
          style={{ width: `${PREVIEW_CONSISTENCY_PERCENT}%` }}
        />
      </div>
    </article>
  );
}

function AiCard() {
  return (
    <article className="flex items-center gap-3 rounded-[var(--radius-xl)] border border-border bg-surface p-4">
      <span className="flex size-10 items-center justify-center rounded-full bg-brand-soft text-brand">
        <FigmaIcon src="/icons/brain.svg" alt="" size={20} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-[11px] font-bold uppercase text-brand">Análise do Coach</p>
        <p className="text-[13px] font-medium text-foreground">
          “Sua progressão de força está acima da média para o período de treinamento atual. Mantenha
          o volume de séries proposto.”
        </p>
      </div>
    </article>
  );
}

export function ProgressScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<ProgressTab>("Força");

  function selectTab(next: ProgressTab) {
    if (next === "Medidas") {
      router.push("/app/body");
      return;
    }
    setTab(next);
  }

  return (
    <AthleteAppShell active="Evolução">
      <div className="flex flex-col gap-5 px-6 pb-6 pt-4">
        <header className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold text-foreground">Evolução</h1>
            <FigmaIcon src="/icons/trending-up.svg" alt="" size={24} className="text-foreground" />
          </div>
          <p className="text-[13px] font-medium text-muted">
            Acompanhamento detalhado do seu progresso
          </p>
        </header>

        <div className="flex gap-2 overflow-x-auto">
          {TABS.map((item) => (
            <Chip key={item} label={item} active={tab === item} onClick={() => selectTab(item)} />
          ))}
        </div>

        {tab === "Força" ? (
          <>
            <StrengthChart />
            <div className="flex gap-3">
              {PREVIEW_STRENGTH_LIFTS.map((lift) => (
                <LiftCard key={lift.name} {...lift} />
              ))}
            </div>
            <ConsistencyCard />
            <AiCard />
          </>
        ) : null}

        {tab === "Visão Geral" ? (
          <>
            <ConsistencyCard />
            <div className="flex gap-3">
              {PREVIEW_STRENGTH_LIFTS.map((lift) => (
                <LiftCard key={lift.name} {...lift} />
              ))}
            </div>
            <AiCard />
          </>
        ) : null}

        {tab === "Volume" ? (
          <>
            <VolumeChart />
            <ConsistencyCard />
            <AiCard />
          </>
        ) : null}

        {tab === "Exercícios" ? (
          <>
            <div className="flex gap-3">
              {PREVIEW_STRENGTH_LIFTS.map((lift) => (
                <LiftCard key={lift.name} {...lift} />
              ))}
            </div>
            <AiCard />
          </>
        ) : null}
      </div>
    </AthleteAppShell>
  );
}
