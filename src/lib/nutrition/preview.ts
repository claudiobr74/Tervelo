import type { MealSlot } from "@/domain/nutrition/meals";
import type { NutritionMacros } from "@/domain/nutrition/macros";

export const PREVIEW_NUTRITION_OBJECTIVE =
  "Aumentar massa muscular com controle do ganho de gordura";

export const PREVIEW_NUTRITION_TARGET: NutritionMacros = {
  energyKcal: 3100,
  proteinG: 180,
  carbohydrateG: 350,
  fatG: 85,
  fluidMl: 3000,
};

export const PREVIEW_NUTRITION_INTAKE: NutritionMacros = {
  energyKcal: 2450,
  proteinG: 142,
  carbohydrateG: 295,
  fatG: 68,
  fluidMl: 2100,
};

export const PREVIEW_MEALS: MealSlot[] = [
  { name: "Café da manhã", energyKcal: 620, proteinG: 35, carbohydrateG: 80, time: "08:00" },
  { name: "Almoço", energyKcal: 950, proteinG: 48, carbohydrateG: 110, time: "12:30" },
  { name: "Lanche pré-treino", energyKcal: 410, proteinG: 15, carbohydrateG: 65, time: "16:30" },
  { name: "Pós-treino", energyKcal: 180, proteinG: 24, carbohydrateG: 15, time: "18:30" },
  { name: "Jantar", energyKcal: 720, proteinG: 40, carbohydrateG: 85, time: "20:30" },
];

export const PREVIEW_NUTRITION_INSIGHT =
  "Consuma o lanche pré-treino pelo menos 60 minutos antes da sessão para otimização de glicogênio.";
