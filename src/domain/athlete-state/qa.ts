export const QA_ATHLETE_STATE_CHECKS = [
  { id: 31, label: "O check-in diário foi superinterpretado?" },
  { id: 32, label: "Uma única sessão gerou mudança estrutural?" },
  { id: 33, label: "A referência individual foi considerada?" },
  { id: 34, label: "A performance objetiva foi considerada?" },
  { id: 35, label: "A nutrição foi considerada quando relevante?" },
  { id: 36, label: "A composição corporal foi considerada quando relevante?" },
  { id: 37, label: "A frequência cardíaca só foi utilizada quando habilitada?" },
  { id: 38, label: "A frequência cardíaca permaneceu complementar?" },
  { id: 39, label: "Houve afirmação causal indevida?" },
  { id: 40, label: "A mudança é maior que o necessário?" },
  { id: 41, label: "O Orçamento de Mudanças foi respeitado?" },
  { id: 42, label: "Dados ausentes permaneceram desconhecidos?" },
  { id: 43, label: "A baixa confiança foi comunicada?" },
  { id: 44, label: "O check-in diário gerou alteração permanente sem evidência longitudinal?" },
] as const;

export type QaAthleteStateFlags = {
  dailyCheckinOverinterpreted: boolean;
  singleSessionStructuralChange: boolean;
  individualReferenceConsidered: boolean;
  objectivePerformanceConsidered: boolean;
  nutritionRelevant: boolean;
  nutritionConsidered: boolean;
  bodyCompositionRelevant: boolean;
  bodyCompositionConsidered: boolean;
  heartRateEnabled: boolean;
  heartRateUsed: boolean;
  heartRateRemainedComplementary: boolean;
  improperCausality: boolean;
  changeLargerThanNeeded: boolean;
  changeBudgetRespected: boolean;
  missingDataRemainedUnknown: boolean;
  lowConfidence: boolean;
  lowConfidenceCommunicated: boolean;
  dailyCheckinPermanentChange: boolean;
};

export type QaAthleteStateResult = {
  ok: boolean;
  blocked: boolean;
  failedChecks: number[];
};

export function auditAthleteStateDecision(flags: QaAthleteStateFlags): QaAthleteStateResult {
  const failedChecks: number[] = [];
  if (flags.dailyCheckinOverinterpreted) failedChecks.push(31);
  if (flags.singleSessionStructuralChange) failedChecks.push(32);
  if (!flags.individualReferenceConsidered) failedChecks.push(33);
  if (!flags.objectivePerformanceConsidered) failedChecks.push(34);
  if (flags.nutritionRelevant && !flags.nutritionConsidered) failedChecks.push(35);
  if (flags.bodyCompositionRelevant && !flags.bodyCompositionConsidered) failedChecks.push(36);
  if (!flags.heartRateEnabled && flags.heartRateUsed) failedChecks.push(37);
  if (flags.heartRateEnabled && !flags.heartRateRemainedComplementary) failedChecks.push(38);
  if (flags.improperCausality) failedChecks.push(39);
  if (flags.changeLargerThanNeeded) failedChecks.push(40);
  if (!flags.changeBudgetRespected) failedChecks.push(41);
  if (!flags.missingDataRemainedUnknown) failedChecks.push(42);
  if (flags.lowConfidence && !flags.lowConfidenceCommunicated) failedChecks.push(43);
  if (flags.dailyCheckinPermanentChange) failedChecks.push(44);
  return { ok: failedChecks.length === 0, blocked: failedChecks.length > 0, failedChecks };
}
