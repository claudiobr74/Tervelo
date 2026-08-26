import { describe, expect, it } from "vitest";
import {
  emptyNutritionContext,
  isUnknown,
  nutritionAdjustmentAction,
  AGENT_CONFLICT_PRIORITY,
  INTEGRATED_OUTPUT_SECTIONS,
} from "./nutrition-context";
import { QA_ADDENDUM_CHECKS, auditIntegratedDecision } from "./qa-addendum";

describe("NUTRITION_CONTEXT", () => {
  it("nasce com campos UNKNOWN e sem inventar dados", () => {
    const ctx = emptyNutritionContext();
    expect(isUnknown(ctx.goal)).toBe(true);
    expect(isUnknown(ctx.energy.targetKcal)).toBe(true);
    expect(isUnknown(ctx.protein.targetGrams)).toBe(true);
    expect(ctx.dataQuality.missingFields).toEqual([]);
  });

  it("ordena ajuste nutricional sem atividade cosmética", () => {
    expect(nutritionAdjustmentAction({ insufficientData: true, trendIsAppropriate: false, outcomeIsOffTarget: true, adherenceIsLow: false })).toBe("OBSERVE");
    expect(nutritionAdjustmentAction({ insufficientData: false, trendIsAppropriate: true, outcomeIsOffTarget: false, adherenceIsLow: false })).toBe("KEEP");
    expect(nutritionAdjustmentAction({ insufficientData: false, trendIsAppropriate: false, outcomeIsOffTarget: true, adherenceIsLow: true })).toBe("ADDRESS_ADHERENCE_FIRST");
    expect(nutritionAdjustmentAction({ insufficientData: false, trendIsAppropriate: false, outcomeIsOffTarget: true, adherenceIsLow: false })).toBe("CONSIDER_NUTRITION_ADJUSTMENT");
  });

  it("expõe prioridade de conflito e seções do output", () => {
    expect(AGENT_CONFLICT_PRIORITY[0]).toBe("segurança");
    expect(INTEGRATED_OUTPUT_SECTIONS).toEqual([
      "Observação",
      "Interpretação",
      "Recomendação",
      "Papel da nutrição",
      "Próxima reavaliação",
    ]);
  });
});

describe("QA addendum 13–20", () => {
  it("lista os oito checks obrigatórios", () => {
    expect(QA_ADDENDUM_CHECKS.map((check) => check.id)).toEqual([13, 14, 15, 16, 17, 18, 19, 20]);
  });

  it("falha conflito grave entre treino e nutrição", () => {
    const result = auditIntegratedDecision({
      nutritionDataAvailable: true,
      nutritionContextPresent: false,
      trainingChangedWithoutNutritionCheck: true,
      nutritionChangedFromIsolatedWeight: false,
      recommendationContradictsTrainingGoal: false,
      conflictingAgentRecommendations: true,
      incompatibleBodyCompMethods: false,
      falseNutritionalPrecision: false,
      causalityWithoutEvidence: false,
    });
    expect(result.ok).toBe(false);
    expect(result.failedChecks).toEqual([13, 14, 17]);
  });

  it("passa quando o contexto nutricional foi considerado", () => {
    const result = auditIntegratedDecision({
      nutritionDataAvailable: true,
      nutritionContextPresent: true,
      trainingChangedWithoutNutritionCheck: false,
      nutritionChangedFromIsolatedWeight: false,
      recommendationContradictsTrainingGoal: false,
      conflictingAgentRecommendations: false,
      incompatibleBodyCompMethods: false,
      falseNutritionalPrecision: false,
      causalityWithoutEvidence: false,
    });
    expect(result.ok).toBe(true);
    expect(result.failedChecks).toEqual([]);
  });
});
