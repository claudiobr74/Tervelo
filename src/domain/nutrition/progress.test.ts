import { describe, expect, it } from "vitest";
import { litersToMl, mlToLiters, targetProgressPercent } from "./progress";
import { sumMealEnergy, type MealSlot } from "./meals";
import { isOpenNutritionDay } from "./macros";

describe("progresso de targets", () => {
  it("calcula percentual limitado entre 0 e 100", () => {
    expect(targetProgressPercent(2450, 3100)).toBeCloseTo((2450 / 3100) * 100);
    expect(targetProgressPercent(0, 180)).toBe(0);
    expect(targetProgressPercent(200, 180)).toBe(100);
    expect(targetProgressPercent(50, 0)).toBe(0);
  });

  it("converte fluido entre mililitros e litros", () => {
    expect(mlToLiters(2100)).toBeCloseTo(2.1);
    expect(litersToMl(3)).toBe(3000);
  });
});

describe("refeições", () => {
  it("soma energia das refeições do dia", () => {
    const meals: MealSlot[] = [
      { name: "Café da manhã", energyKcal: 620, proteinG: 35, carbohydrateG: 80, time: "08:00" },
      { name: "Almoço", energyKcal: 950, proteinG: 48, carbohydrateG: 110, time: "12:30" },
    ];
    expect(sumMealEnergy(meals)).toBe(1570);
  });
});

describe("dia aberto", () => {
  it("não atualiza check-in de dia anterior", () => {
    expect(isOpenNutritionDay("2026-08-25", "2026-08-26")).toBe(false);
  });
});
