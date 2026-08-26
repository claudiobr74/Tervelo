import { describe, expect, it } from "vitest";
import { auditAthleteStateDecision } from "./qa";

const okFlags = {
  dailyCheckinOverinterpreted: false,
  singleSessionStructuralChange: false,
  individualReferenceConsidered: true,
  objectivePerformanceConsidered: true,
  nutritionRelevant: true,
  nutritionConsidered: true,
  bodyCompositionRelevant: false,
  bodyCompositionConsidered: false,
  heartRateEnabled: false,
  heartRateUsed: false,
  heartRateRemainedComplementary: true,
  improperCausality: false,
  changeLargerThanNeeded: false,
  changeBudgetRespected: true,
  missingDataRemainedUnknown: true,
  lowConfidence: false,
  lowConfidenceCommunicated: true,
  dailyCheckinPermanentChange: false,
};

describe("Auditor de Qualidade — Estado do Atleta", () => {
  it("passa quando as regras protegidas são respeitadas", () => {
    expect(auditAthleteStateDecision(okFlags)).toEqual({ ok: true, blocked: false, failedChecks: [] });
  });

  it("bloqueia superinterpretação de check-in e mudança estrutural de uma sessão", () => {
    const result = auditAthleteStateDecision({
      ...okFlags,
      dailyCheckinOverinterpreted: true,
      singleSessionStructuralChange: true,
      dailyCheckinPermanentChange: true,
      improperCausality: true,
    });
    expect(result.blocked).toBe(true);
    expect(result.failedChecks).toEqual([31, 32, 39, 44]);
  });

  it("bloqueia uso de frequência cardíaca desligada", () => {
    const result = auditAthleteStateDecision({
      ...okFlags,
      heartRateEnabled: false,
      heartRateUsed: true,
    });
    expect(result.failedChecks).toContain(37);
  });
});
