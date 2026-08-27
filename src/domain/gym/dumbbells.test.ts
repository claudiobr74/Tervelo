import { describe, expect, it } from "vitest";
import { canLoadDumbbell, expandDumbbellWeights } from "./dumbbells";

describe("halteres do ginásio", () => {
  it("lista discreta", () => {
    const set = { mode: "list" as const, weightsKg: [2, 4, 6, 8, 10] };
    expect(expandDumbbellWeights(set)).toEqual({ ok: true, value: [2, 4, 6, 8, 10] });
    expect(canLoadDumbbell(set, 8).ok).toBe(true);
    expect(canLoadDumbbell(set, 7)).toEqual({ ok: false, error: { code: "unavailable_weight" } });
  });

  it("faixa min/max/incremento", () => {
    const set = { mode: "range" as const, minKg: 2, maxKg: 10, incrementKg: 2 };
    expect(expandDumbbellWeights(set)).toEqual({ ok: true, value: [2, 4, 6, 8, 10] });
    expect(canLoadDumbbell(set, 10).ok).toBe(true);
    expect(canLoadDumbbell(set, 5).ok).toBe(false);
  });
});
