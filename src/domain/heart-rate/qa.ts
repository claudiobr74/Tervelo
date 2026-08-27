export const QA_HEART_RATE_CHECKS = [
  { id: 21, label: "A preferência de frequência cardíaca está ativa?" },
  { id: 22, label: "Há dados suficientes?" },
  { id: 23, label: "A cobertura do sinal é adequada?" },
  { id: 24, label: "Houve troca de dispositivo?" },
  { id: 25, label: "A frequência cardíaca foi usada apenas como contexto?" },
  { id: 26, label: "Uma única leitura influenciou a decisão indevidamente?" },
  { id: 27, label: "A IA inferiu esforço muscular a partir do BPM?" },
  { id: 28, label: "A IA inferiu diagnóstico?" },
  { id: 29, label: "A IA atribuiu causalidade sem suporte?" },
  { id: 30, label: "Dados de treino mais específicos contradizem a leitura cardíaca?" },
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
