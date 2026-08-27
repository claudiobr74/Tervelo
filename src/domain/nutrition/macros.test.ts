import { describe, expect, it } from "vitest";
import { energyFromMacros, isOpenNutritionDay, NUTRITION_LABELS } from "./macros";

describe("nutrição", () => {
  it("usa nomes por extenso", () => {
    expect(NUTRITION_LABELS.proteinG).toBe("Proteína");
    expect(NUTRITION_LABELS.carbohydrateG).toBe("Carboidrato");
  });

  it("só o dia aberto pode ser atualizado", () => {
    expect(isOpenNutritionDay("2026-08-26", "2026-08-26")).toBe(true);
    expect(isOpenNutritionDay("2026-08-25", "2026-08-26")).toBe(false);
  });

  it("energia estimada a partir dos macros", () => {
    expect(energyFromMacros({ proteinG: 180, carbohydrateG: 250, fatG: 70 })).toBe(2350);
  });
});
