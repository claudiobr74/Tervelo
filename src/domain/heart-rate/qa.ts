export const QA_HEART_RATE_CHECKS = [
  { id: 21, label: "heart_rate_enabled está ativo?" },
  { id: 22, label: "há dados suficientes?" },
  { id: 23, label: "cobertura é adequada?" },
  { id: 24, label: "houve troca de dispositivo?" },
  { id: 25, label: "frequência cardíaca foi usada apenas como contexto?" },
  { id: 26, label: "uma única leitura influenciou decisão indevidamente?" },
  { id: 27, label: "IA inferiu esforço muscular a partir de BPM?" },
  { id: 28, label: "IA inferiu diagnóstico?" },
  { id: 29, label: "IA atribuiu causalidade sem suporte?" },
  { id: 30, label: "dados de treino mais específicos contradizem a interpretação cardíaca?" },
] as const;

export type QaHeartRateFlags = {
  heartRateEnabled: boolean;
  heartRateContextPresent: boolean;
  sufficientData: boolean;
  coverageAdequate: boolean;
  deviceChanged: boolean;
  usedOnlyAsContext: boolean;
  singleReadingDroveDecision: boolean;
  inferredMuscularEffortFromBpm: boolean;
  inferredDiagnosis: boolean;
  causalityWithoutSupport: boolean;
  trainingDataContradictsCardiacReading: boolean;
};

export function auditHeartRateDecision(flags: QaHeartRateFlags): {
  ok: boolean;
  failedChecks: number[];
} {
  const failedChecks: number[] = [];
  if (flags.heartRateEnabled && flags.sufficientData && !flags.heartRateContextPresent) {
    failedChecks.push(21, 22);
  }
  if (flags.heartRateEnabled && flags.sufficientData && !flags.coverageAdequate) {
    failedChecks.push(23);
  }
  if (flags.heartRateEnabled && flags.deviceChanged && flags.usedOnlyAsContext === false) {
    failedChecks.push(24);
  }
  if (flags.heartRateEnabled && !flags.usedOnlyAsContext) failedChecks.push(25);
  if (flags.singleReadingDroveDecision) failedChecks.push(26);
  if (flags.inferredMuscularEffortFromBpm) failedChecks.push(27);
  if (flags.inferredDiagnosis) failedChecks.push(28);
  if (flags.causalityWithoutSupport) failedChecks.push(29);
  if (flags.trainingDataContradictsCardiacReading) failedChecks.push(30);
  return { ok: failedChecks.length === 0, failedChecks };
}
