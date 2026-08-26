"use client";

import { useMemo, useState } from "react";
import { AthleteAppShell } from "@/components/app/athlete-shell";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { effectiveHistory, latestByTime } from "@/domain/measurement/append-only";
import {
  BODY_PERIODS,
  deltaInWindow,
  inWindow,
  leanMassKg,
  meanOf,
  round1,
  type BodyPeriodId,
  type CompositionPoint,
} from "@/domain/measurement/composition";
import { formatMeasure, formatPercent, formatSignedDelta } from "@/lib/longitudinal/format";
import { useLongitudinal } from "@/lib/longitudinal/preview-store";

function toPoints(rows: { id: string; measuredAt: string; supersedesId?: string; weightKg?: number; bodyFatPercent?: number; waistCm?: number; rightArmCm?: number; rightThighCm?: number }[]): CompositionPoint[] {
  return rows.map((row) => ({
    id: row.id,
    recordedAt: new Date(row.measuredAt),
    supersedesId: row.supersedesId,
    weightKg: row.weightKg,
    bodyFatPercent: row.bodyFatPercent,
    waistCm: row.waistCm,
    rightArmCm: row.rightArmCm,
    rightThighCm: row.rightThighCm,
  }));
}

function MetricBox({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend?: string;
}) {
  return (
    <article className="flex min-w-0 flex-1 flex-col gap-1.5 rounded-[var(--radius-lg)] border border-border bg-surface p-3.5">
      <p className="text-[11px] font-medium text-muted">{label}</p>
      <p className="text-[22px] font-bold leading-none text-foreground">{value}</p>
      {trend ? <p className="text-[11px] font-medium text-success">{trend}</p> : null}
    </article>
  );
}

function CircumferenceRow({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta: string | null;
}) {
  return (
    <article className="flex items-center justify-between rounded-[var(--radius-lg)] border border-border bg-surface p-3.5">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div className="flex items-center gap-3">
        <p className="text-sm font-bold text-foreground">{value}</p>
        {delta ? (
          <span className="rounded bg-success/20 px-1.5 py-0.5 text-[11px] font-bold text-success">{delta}</span>
        ) : null}
      </div>
    </article>
  );
}

export function BodyMetricsScreen() {
  const { measurements } = useLongitudinal();
  const [periodId, setPeriodId] = useState<BodyPeriodId>("30d");
  const period = BODY_PERIODS.find((item) => item.id === periodId) ?? BODY_PERIODS[1];
  const now = useMemo(() => new Date(), []);
  const points = useMemo(() => toPoints(measurements), [measurements]);
  const latest = latestByTime(points);
  const lean =
    latest?.weightKg !== undefined && latest.bodyFatPercent !== undefined
      ? round1(leanMassKg(latest.weightKg, latest.bodyFatPercent))
      : null;
  const avg7d = meanOf(inWindow(effectiveHistory(points), now, 7), "weightKg");
  const weightDelta = deltaInWindow(points, "weightKg", now, period.days);
  const fatDelta = deltaInWindow(points, "bodyFatPercent", now, period.days);
  const waistDelta = deltaInWindow(points, "waistCm", now, period.days);
  const armDelta = deltaInWindow(points, "rightArmCm", now, period.days);
  const thighDelta = deltaInWindow(points, "rightThighCm", now, period.days);

  return (
    <AthleteAppShell active="Evolução">
      <div className="flex flex-col gap-5 px-6 pb-6 pt-4">
        <header className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold text-foreground">Corpo e Medidas</h1>
            <FigmaIcon src="/icons/dumbbell.svg" alt="" size={24} className="text-foreground" />
          </div>
          <p className="text-[13px] font-medium text-muted">Métricas de composição corporal</p>
        </header>

        <div className="flex items-center justify-between rounded-[10px] bg-surface p-1">
          {BODY_PERIODS.map((item) => {
            const selected = item.id === periodId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setPeriodId(item.id)}
                className={`rounded-[var(--radius-sm)] px-3.5 py-1.5 text-[11px] font-bold ${
                  selected ? "bg-brand text-on-brand" : "text-muted"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="flex gap-3">
          <MetricBox
            label="Peso Atual"
            value={latest?.weightKg !== undefined ? formatMeasure(latest.weightKg, "kg") : "—"}
            trend={
              weightDelta !== null && weightDelta !== 0
                ? `${formatSignedDelta(round1(weightDelta), "kg")} ${period.deltaLabel}`
                : undefined
            }
          />
          <MetricBox
            label="Gordura Corporal"
            value={latest?.bodyFatPercent !== undefined ? formatPercent(latest.bodyFatPercent) : "—"}
            trend={
              fatDelta !== null && fatDelta !== 0
                ? `${formatSignedDelta(round1(fatDelta), "")}% ${period.deltaLabel}`
                : undefined
            }
          />
        </div>

        <div className="flex gap-3">
          <article className="flex min-w-0 flex-1 flex-col gap-1.5 rounded-[var(--radius-lg)] border border-border bg-surface p-3.5">
            <p className="text-[11px] font-medium text-muted">Massa Magra Est.</p>
            <p className="text-lg font-bold text-foreground">{lean !== null ? formatMeasure(lean, "kg") : "—"}</p>
          </article>
          <article className="flex min-w-0 flex-1 flex-col gap-1.5 rounded-[var(--radius-lg)] border border-border bg-surface p-3.5">
            <p className="text-[11px] font-medium text-muted">Peso Médio (7d)</p>
            <p className="text-lg font-bold text-foreground">
              {avg7d !== null ? formatMeasure(round1(avg7d), "kg") : "—"}
            </p>
          </article>
        </div>

        <section className="flex flex-col gap-2.5">
          <p className="text-sm font-bold uppercase text-muted">Medidas Corporais</p>
          <CircumferenceRow
            label="Cintura"
            value={latest?.waistCm !== undefined ? formatMeasure(latest.waistCm, "cm", 0) : "—"}
            delta={waistDelta !== null ? formatSignedDelta(round1(waistDelta), "cm") : null}
          />
          <CircumferenceRow
            label="Braço D"
            value={latest?.rightArmCm !== undefined ? formatMeasure(latest.rightArmCm, "cm") : "—"}
            delta={armDelta !== null ? formatSignedDelta(round1(armDelta), "cm") : null}
          />
          <CircumferenceRow
            label="Coxa D"
            value={latest?.rightThighCm !== undefined ? formatMeasure(latest.rightThighCm, "cm", 0) : "—"}
            delta={thighDelta !== null ? formatSignedDelta(round1(thighDelta), "cm") : null}
          />
        </section>

        <article className="flex flex-col gap-2.5 rounded-[var(--radius-xl)] border border-brand bg-brand-soft p-4">
          <div className="flex items-center gap-2">
            <FigmaIcon src="/icons/brain.svg" alt="" size={16} className="text-brand" />
            <p className="text-[11px] font-bold uppercase text-brand">Evolução Recomendada</p>
          </div>
          <p className="text-[13px] font-medium text-foreground">
            “Seu aumento de peso está ocorrendo com pequena variação da cintura e melhora consistente da
            força. O progresso é altamente compatível com o objetivo de ganho de massa muscular magra.”
          </p>
        </article>
      </div>
    </AthleteAppShell>
  );
}
