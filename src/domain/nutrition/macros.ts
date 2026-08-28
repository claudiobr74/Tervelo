export const NUTRITION_LABELS = {
  energyKcal: "Energia",
  proteinG: "Proteína",
  carbohydrateG: "Carboidrato",
  fatG: "Gordura",
  fluidMl: "Fluido",
} as const;

export type NutritionMacros = {
  energyKcal: number;
  proteinG: number;
  carbohydrateG: number;
  fatG: number;
  fluidMl: number;
};

export function isOpenNutritionDay(checkedInOnIso: string, todayIso: string): boolean {
  return checkedInOnIso === todayIso;
}

export function energyFromMacros(
  macros: Pick<NutritionMacros, "proteinG" | "carbohydrateG" | "fatG">,
): number {
  return macros.proteinG * 4 + macros.carbohydrateG * 4 + macros.fatG * 9;
}
