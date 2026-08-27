export type StrengthLift = {
  name: string;
  currentKg: number;
  previousKg: number;
  weeks: number;
};

export const PREVIEW_STRENGTH_LIFTS: StrengthLift[] = [];

export const PREVIEW_BENCH_BARS: { height: number; kg: number }[] = [];

export const PREVIEW_BENCH_LABELS: { label: string; accent: boolean }[] = [];

export const PREVIEW_CONSISTENCY_PERCENT = 0;

export const PREVIEW_VOLUME_BARS: number[] = [];
