import type { NutritionMacros } from "./macros";

export function targetProgressPercent(current: number, target: number): number {
  if (!(target > 0) || !Number.isFinite(current) || !Number.isFinite(target)) return 0;
  return Math.min(100, Math.max(0, (current / target) * 100));
}

export function mlToLiters(ml: number): number {
  return ml / 1000;
}

export function litersToMl(liters: number): number {
  return liters * 1000;
}

export type NutritionIntake = NutritionMacros;

export type NutritionTarget = NutritionMacros;
