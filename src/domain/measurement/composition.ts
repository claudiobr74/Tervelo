import { effectiveHistory, type LongitudinalRow } from "./append-only";

export type CompositionPoint = LongitudinalRow & {
  weightKg?: number;
  bodyFatPercent?: number;
  waistCm?: number;
  rightArmCm?: number;
  rightThighCm?: number;
};

export const BODY_PERIODS = [
  { id: "7d", label: "7d", days: 7, deltaLabel: "esta semana" },
  { id: "30d", label: "30d", days: 30, deltaLabel: "este mês" },
  { id: "3m", label: "3m", days: 90, deltaLabel: "neste trimestre" },
  { id: "6m", label: "6m", days: 180, deltaLabel: "neste semestre" },
  { id: "1a", label: "1a", days: 365, deltaLabel: "neste ano" },
] as const;

export type BodyPeriodId = (typeof BODY_PERIODS)[number]["id"];

export function leanMassKg(weightKg: number, bodyFatPercent: number): number {
  return weightKg * (1 - bodyFatPercent / 100);
}

export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function inWindow<T extends { recordedAt: Date }>(
  rows: readonly T[],
  now: Date,
  days: number,
): T[] {
  const since = now.getTime() - days * 24 * 60 * 60 * 1000;
  const until = now.getTime();
  return rows.filter((row) => {
    const time = row.recordedAt.getTime();
    return time >= since && time <= until;
  });
}

export function meanOf(
  rows: readonly CompositionPoint[],
  key: "weightKg" | "bodyFatPercent" | "waistCm" | "rightArmCm" | "rightThighCm",
): number | null {
  const values = rows
    .map((row) => row[key])
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function deltaInWindow(
  rows: readonly CompositionPoint[],
  key: "weightKg" | "bodyFatPercent" | "waistCm" | "rightArmCm" | "rightThighCm",
  now: Date,
  days: number,
): number | null {
  const windowed = inWindow(effectiveHistory(rows), now, days)
    .filter((row) => typeof row[key] === "number")
    .sort((left, right) => left.recordedAt.getTime() - right.recordedAt.getTime());
  if (windowed.length < 2) return null;
  const first = windowed[0][key];
  const last = windowed[windowed.length - 1][key];
  if (typeof first !== "number" || typeof last !== "number") return null;
  return last - first;
}
