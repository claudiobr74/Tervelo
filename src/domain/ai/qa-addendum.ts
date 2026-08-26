export const QA_ADDENDUM_CHECKS = [
  { id: 13, label: "O contexto nutricional relevante foi considerado?" },
  { id: 14, label: "A IA alterou treino sem investigar possível componente nutricional?" },
  { id: 15, label: "A IA alterou nutrição com base em peso isolado?" },
  { id: 16, label: "A recomendação nutricional contradiz o objetivo do treinamento?" },
  { id: 17, label: "Training Coach e Nutrition Coach produziram recomendações conflitantes?" },
  { id: 18, label: "A composição corporal foi interpretada usando métodos incompatíveis?" },
  { id: 19, label: "Há falsa precisão nutricional?" },
  { id: 20, label: "A IA afirmou causalidade sem evidência suficiente?" },
] as const;

export type QaAddendumFlags = {
  nutritionDataAvailable: boolean;
  nutritionContextPresent: boolean;
  trainingChangedWithoutNutritionCheck: boolean;
  nutritionChangedFromIsolatedWeight: boolean;
  recommendationContradictsTrainingGoal: boolean;
  conflictingAgentRecommendations: boolean;
  incompatibleBodyCompMethods: boolean;
  falseNutritionalPrecision: boolean;
  causalityWithoutEvidence: boolean;
};

export function auditIntegratedDecision(flags: QaAddendumFlags): {
  ok: boolean;
  failedChecks: number[];
} {
  const failedChecks: number[] = [];
  if (flags.nutritionDataAvailable && !flags.nutritionContextPresent) failedChecks.push(13);
  if (flags.trainingChangedWithoutNutritionCheck) failedChecks.push(14);
  if (flags.nutritionChangedFromIsolatedWeight) failedChecks.push(15);
  if (flags.recommendationContradictsTrainingGoal) failedChecks.push(16);
  if (flags.conflictingAgentRecommendations) failedChecks.push(17);
  if (flags.incompatibleBodyCompMethods) failedChecks.push(18);
  if (flags.falseNutritionalPrecision) failedChecks.push(19);
  if (flags.causalityWithoutEvidence) failedChecks.push(20);
  return { ok: failedChecks.length === 0, failedChecks };
}
