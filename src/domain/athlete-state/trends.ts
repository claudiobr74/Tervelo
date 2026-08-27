import { percentChange } from "../progress/change";
import { MIN_POINTS_FOR_TREND } from "../recovery/trend";

export type TrendDirection = "up" | "down" | "stable" | "insufficient";

export type NumericSeriesPoint = {
  at: number;
  value: number;
};

function finiteValues(values: readonly number[]): number[] {
  return values.filter((value) => Number.isFinite(value));
}

export function movingAverage(values: readonly number[], window: number): number | null {
  const series = finiteValues(values);
  if (window < 1 || series.length < window) return null;
  const slice = series.slice(-window);
  return slice.reduce((sum, value) => sum + value, 0) / slice.length;
}

/** Inclinação por regressão linear simples (x = índice). Não calcular no modelo de linguagem. */
export function linearSlope(values: readonly number[]): number | null {
  const series = finiteValues(values);
  if (series.length < MIN_POINTS_FOR_TREND) return null;
  const n = series.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (let index = 0; index < n; index += 1) {
    sumX += index;
    sumY += series[index];
    sumXY += index * series[index];
    sumXX += index * index;
  }
  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return 0;
  return (n * sumXY - sumX * sumY) / denominator;
}

export function classifySlope(slope: number | null, stableThreshold = 0.05): TrendDirection {
  if (slope == null) return "insufficient";
  if (Math.abs(slope) <= stableThreshold) return "stable";
  return slope > 0 ? "up" : "down";
}

export function percentChangeWindow(current: number, previous: number): number | null {
  return percentChange(current, previous);
}

export function adherenceRate(completed: number, planned: number): number | null {
  if (!Number.isFinite(completed) || !Number.isFinite(planned) || planned <= 0) return null;
  return Math.min(1, Math.max(0, completed / planned));
}

export function classifyAdherence(rate: number | null): "ALTA" | "MODERADA" | "BAIXA" | "INDEFINIDO" {
  if (rate == null) return "INDEFINIDO";
  if (rate >= 0.85) return "ALTA";
  if (rate >= 0.6) return "MODERADA";
  return "BAIXA";
}

/** Nunca interpretar um ponto isolado como mudança corporal relevante. */
export function weightTrajectory(weights: readonly number[]): TrendDirection {
  if (finiteValues(weights).length < MIN_POINTS_FOR_TREND) return "insufficient";
  return classifySlope(linearSlope(weights), 0.08);
}

export function meanOf(values: readonly number[]): number | null {
  const series = finiteValues(values);
  if (series.length === 0) return null;
  return series.reduce((sum, value) => sum + value, 0) / series.length;
}

export function compareToIndividualReference(
  recent: readonly number[],
  habitual: readonly number[],
  lowerIsWorse = true,
): "unknown" | "normal" | "below" | "above" {
  const recentMean = meanOf(recent);
  const habitualMean = meanOf(habitual);
  if (recentMean == null || habitualMean == null) return "unknown";
  const delta = recentMean - habitualMean;
  const threshold = Math.max(0.35, Math.abs(habitualMean) * 0.08);
  if (Math.abs(delta) < threshold) return "normal";
  if (lowerIsWorse) return delta < 0 ? "below" : "above";
  return delta > 0 ? "above" : "below";
}

export function sortChronological(points: readonly NumericSeriesPoint[]): NumericSeriesPoint[] {
  return [...points].sort((a, b) => a.at - b.at);
}
