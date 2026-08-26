export type StrengthLift = {
  name: string;
  currentKg: number;
  previousKg: number;
  weeks: number;
};

export const PREVIEW_STRENGTH_LIFTS: StrengthLift[] = [
  { name: "Supino Reto", currentKg: 82, previousKg: 82 / 1.12, weeks: 8 },
  { name: "Agachamento", currentKg: 110, previousKg: 110 / 1.08, weeks: 8 },
];

export const PREVIEW_BENCH_BARS = [
  { height: 30, kg: 68 },
  { height: 42, kg: 72 },
  { height: 50, kg: 75 },
  { height: 64, kg: 79 },
  { height: 78, kg: 82 },
] as const;

export const PREVIEW_BENCH_LABELS = [
  { label: "Mai", accent: false },
  { label: "Jun", accent: false },
  { label: "Jul", accent: true },
] as const;

export const PREVIEW_CONSISTENCY_PERCENT = 92;

export const PREVIEW_VOLUME_BARS = [28, 36, 44, 52, 62] as const;
