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
import { bodyTrendCopy } from "@/domain/measurement/trend-copy";
import { parseDecimalInRange } from "@/domain/athlete/decimal";
import { formatMeasure, formatPercent, formatSignedDelta } from "@/lib/longitudinal/format";
import { appendBodyMeasurement, useLongitudinal } from "@/lib/longitudinal/preview-store";
import { useSyncStatus } from "@/components/app/sync-status-indicator";
import { SYNC_COPY } from "@/domain/offline";

function toPoints(
  rows: {
    id: string;
    measuredAt: string;
    supersedesId?: string;
    weightKg?: number;
    bodyFatPercent?: number;
    waistCm?: number;
    rightArmCm?: number;
    rightThighCm?: number;
  }[],
): CompositionPoint[] {
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

function MetricBox({ label, value, trend }: { label: string; value: string; trend?: string }) {
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
          <span className="rounded bg-success/20 px-1.5 py-0.5 text-[11px] font-bold text-success">
            {delta}
          </span>
        ) : null}
      </div>
    </article>
  );
}

export function BodyMetricsScreen() {
  const { measurements } = useLongitudinal();
  const sync = useSyncStatus();
  const [periodId, setPeriodId] = useState<BodyPeriodId>("30d");
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
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
  const analysis = bodyTrendCopy({ weightDelta, waistDelta, fatDelta });

  async function saveMeasurement() {
    const weightKg = parseDecimalInRange(weight, 20, 400);
    const waistCm = parseDecimalInRange(waist, 30, 250);
    if (weightKg === null && waistCm === null) {
      setSaved(false);
      setFormError("Informe um peso ou uma medida de cintura válidos.");
      return;
    }
    setFormError(null);
    await appendBodyMeasurement({
      ...(weightKg !== null ? { weightKg } : {}),
      ...(waistCm !== null ? { waistCm } : {}),
    });
    setWeight("");
    setWaist("");
    setSaved(true);
  }

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
            value={
              latest?.bodyFatPercent !== undefined ? formatPercent(latest.bodyFatPercent) : "—"
            }
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
            <p className="text-lg font-bold text-foreground">
              {lean !== null ? formatMeasure(lean, "kg") : "—"}
            </p>
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
            value={
              latest?.rightThighCm !== undefined ? formatMeasure(latest.rightThighCm, "cm", 0) : "—"
            }
            delta={thighDelta !== null ? formatSignedDelta(round1(thighDelta), "cm") : null}
          />
        </section>

        <section className="flex flex-col gap-3 rounded-[var(--radius-xl)] border border-border bg-surface p-4">
          <h2 className="text-sm font-bold text-foreground">Registrar agora</h2>
          <label className="flex flex-col gap-1 text-xs text-muted">
            Peso (kg)
            <input
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              inputMode="decimal"
              placeholder="Ex: 82,4"
              className="h-11 rounded-[var(--radius-md)] border border-border bg-background px-3 text-sm text-foreground"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            Cintura (cm)
            <input
              value={waist}
              onChange={(event) => setWaist(event.target.value)}
              inputMode="decimal"
              placeholder="Ex: 84"
              className="h-11 rounded-[var(--radius-md)] border border-border bg-background px-3 text-sm text-foreground"
            />
          </label>
          {formError ? <p className="text-xs text-error">{formError}</p> : null}
          {saved ? <p className="text-xs text-success">Medidas registradas.</p> : null}
          <button
            type="button"
            onClick={() => void saveMeasurement()}
            className="flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-brand text-sm font-bold text-on-brand"
          >
            Salvar medidas
          </button>
        </section>

        {analysis ? (
          <article className="flex flex-col gap-2.5 rounded-[var(--radius-xl)] border border-brand bg-brand-soft p-4">
            <div className="flex items-center gap-2">
              <FigmaIcon src="/icons/brain.svg" alt="" size={16} className="text-brand" />
              <p className="text-[11px] font-bold uppercase text-brand">Evolução Recomendada</p>
            </div>
            <p className="text-[13px] font-medium text-foreground">
              “{sync.online ? analysis : SYNC_COPY.coachAnalysisWhenOnline}”
            </p>
          </article>
        ) : null}
      </div>
    </AthleteAppShell>
  );
}
