export { ageYearsFromBirthDate } from "./athlete/age";
export { canUpdateMetrics, effectiveHistory, latestByTime } from "./measurement/append-only";
export { leanMassKg, round1 } from "./measurement/composition";
export { calculatePlates, listPlateAssemblies, typicalPlateStock } from "./plates/calculate";
export { searchCatalogExercises } from "./exercise/search";
export {
  adjustRestTimer,
  remainingSeconds,
  startRestTimer,
} from "./timer/rest-timer";
export { classifyRecovery, scoresFromSliders } from "./recovery/score";
export { recoveryTrend } from "./recovery/trend";
export { percentChange } from "./progress/change";
export { METRIC_LABELS } from "./labels";
export { AI_AGENTS, DEFAULT_AI_AGENT, agentLabel } from "./ai/agents";
export {
  AI_IDENTITY_PROMPT,
  AI_POLICY_LOCKS,
  DEFAULT_AI_AUTONOMY,
} from "./ai/contract";
export { emptyNutritionContext, nutritionAdjustmentAction } from "./ai/nutrition-context";
export { QA_ADDENDUM_CHECKS, auditIntegratedDecision } from "./ai/qa-addendum";
export { parseHeartRateMeasurement } from "./heart-rate/parse-measurement";
export { buildHeartRateContext, HEART_RATE_ANALYSIS_RULE } from "./heart-rate/context";
export { QA_HEART_RATE_CHECKS, auditHeartRateDecision } from "./heart-rate/qa";
export { NUTRITION_LABELS, energyFromMacros, isOpenNutritionDay } from "./nutrition/macros";
export { mlToLiters, targetProgressPercent } from "./nutrition/progress";
