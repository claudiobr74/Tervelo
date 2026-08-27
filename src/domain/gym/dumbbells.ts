import { err, ok, type Result } from "../result";

export type DumbbellSet =
  | { mode: "list"; weightsKg: readonly number[] }
  | { mode: "range"; minKg: number; maxKg: number; incrementKg: number };

export type DumbbellError = { code: "invalid_set" } | { code: "unavailable_weight" };

function nearlyEqual(a: number, b: number): boolean {
  return Math.abs(a - b) < 1e-6;
}

export function expandDumbbellWeights(set: DumbbellSet): Result<number[], DumbbellError> {
  if (set.mode === "list") {
    const weights = [...new Set(set.weightsKg.filter((kg) => kg > 0))].sort((a, b) => a - b);
    if (weights.length === 0) return err({ code: "invalid_set" });
    return ok(weights);
  }
  if (!(set.incrementKg > 0) || set.maxKg < set.minKg || set.minKg < 0) {
    return err({ code: "invalid_set" });
  }
  const weights: number[] = [];
  const steps = Math.round((set.maxKg - set.minKg) / set.incrementKg);
  for (let i = 0; i <= steps; i += 1) {
    weights.push(Number((set.minKg + i * set.incrementKg).toFixed(4)));
  }
  return ok(weights);
}

export function canLoadDumbbell(
  set: DumbbellSet,
  weightKg: number,
): Result<true, DumbbellError> {
  const expanded = expandDumbbellWeights(set);
  if (!expanded.ok) return expanded;
  if (expanded.value.some((kg) => nearlyEqual(kg, weightKg))) {
    return ok(true);
  }
  return err({ code: "unavailable_weight" });
}
