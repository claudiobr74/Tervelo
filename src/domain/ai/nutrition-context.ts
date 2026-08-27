export const UNKNOWN = null;

export type UnknownOr<T> = T | null;

export type MacroContext = {
  targetGrams: UnknownOr<number>;
  estimatedIntakeGrams: UnknownOr<number>;
  adherence: UnknownOr<string>;
};

export type NutritionContext = {
  goal: UnknownOr<string>;
  phase: UnknownOr<string>;
  energy: {
    targetKcal: UnknownOr<number>;
    estimatedIntakeKcal: UnknownOr<number>;
    adherence: UnknownOr<string>;
  };
  protein: MacroContext;
  carbohydrate: MacroContext;
  fat: MacroContext;
  hydration: {
    targetMl: UnknownOr<number>;
    estimatedIntakeMl: UnknownOr<number>;
    status: UnknownOr<string>;
  };
  timing: {
    preWorkout: UnknownOr<string>;
    postWorkout: UnknownOr<string>;
    mealDistribution: UnknownOr<string>;
  };
  behavior: {
    hungerTrend: UnknownOr<string>;
    satietyTrend: UnknownOr<string>;
    nutritionAdherence: UnknownOr<string>;
  };
  bodyTrend: {
    weightTrend: UnknownOr<string>;
    waistTrend: UnknownOr<string>;
    skinfoldTrend: UnknownOr<string>;
    bodyCompositionMethod: UnknownOr<string>;
  };
  dataQuality: {
    completeness: UnknownOr<string>;
    confidence: UnknownOr<string>;
    missingFields: string[];
  };
};

export function emptyNutritionContext(): NutritionContext {
  return {
    goal: UNKNOWN,
    phase: UNKNOWN,
    energy: { targetKcal: UNKNOWN, estimatedIntakeKcal: UNKNOWN, adherence: UNKNOWN },
    protein: { targetGrams: UNKNOWN, estimatedIntakeGrams: UNKNOWN, adherence: UNKNOWN },
    carbohydrate: { targetGrams: UNKNOWN, estimatedIntakeGrams: UNKNOWN, adherence: UNKNOWN },
    fat: { targetGrams: UNKNOWN, estimatedIntakeGrams: UNKNOWN, adherence: UNKNOWN },
    hydration: { targetMl: UNKNOWN, estimatedIntakeMl: UNKNOWN, status: UNKNOWN },
    timing: { preWorkout: UNKNOWN, postWorkout: UNKNOWN, mealDistribution: UNKNOWN },
    behavior: { hungerTrend: UNKNOWN, satietyTrend: UNKNOWN, nutritionAdherence: UNKNOWN },
    bodyTrend: {
      weightTrend: UNKNOWN,
      waistTrend: UNKNOWN,
      skinfoldTrend: UNKNOWN,
      bodyCompositionMethod: UNKNOWN,
    },
    dataQuality: { completeness: UNKNOWN, confidence: UNKNOWN, missingFields: [] },
  };
}

export function isUnknown(value: unknown): boolean {
  return value === UNKNOWN;
}

export const NUTRITION_ADJUSTMENT_ACTIONS = [
  "KEEP",
  "OBSERVE",
  "ADDRESS_ADHERENCE_FIRST",
  "CONSIDER_NUTRITION_ADJUSTMENT",
] as const;

export type NutritionAdjustmentAction = (typeof NUTRITION_ADJUSTMENT_ACTIONS)[number];

export function nutritionAdjustmentAction(input: {
  insufficientData: boolean;
  trendIsAppropriate: boolean;
  outcomeIsOffTarget: boolean;
  adherenceIsLow: boolean;
}): NutritionAdjustmentAction {
  if (input.insufficientData) return "OBSERVE";
  if (input.trendIsAppropriate) return "KEEP";
  if (input.outcomeIsOffTarget && input.adherenceIsLow) return "ADDRESS_ADHERENCE_FIRST";
  if (input.outcomeIsOffTarget && !input.adherenceIsLow) return "CONSIDER_NUTRITION_ADJUSTMENT";
  return "KEEP";
}

export const AGENT_CONFLICT_PRIORITY = [
  "segurança",
  "dados",
  "objetivo",
  "recuperação",
  "coerência longitudinal",
] as const;

export const INTEGRATED_OUTPUT_SECTIONS = [
  "Observação",
  "Interpretação",
  "Recomendação",
  "Papel da nutrição",
  "Próxima reavaliação",
] as const;

export const LONGITUDINAL_SYSTEM = [
  "treino",
  "nutrição",
  "composição corporal",
  "recuperação",
  "performance",
] as const;
