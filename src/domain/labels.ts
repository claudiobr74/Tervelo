/** Copy de produto em português por extenso. Sem siglas na UI. */
export const METRIC_LABELS = {
  repsInReserve: "Repetições em reserva",
  perceivedExertion: "Esforço percebido",
  perceivedRecovery: "Recuperação percebida",
  sleepQuality: "Qualidade do sono",
  muscleSoreness: "Dor muscular",
  energyKcal: "Energia",
  proteinG: "Proteína",
  carbohydrateG: "Carboidrato",
  fatG: "Gordura",
  fluidMl: "Fluido",
  bodyFatPercent: "Percentual de gordura",
  restSeconds: "Descanso",
} as const;

export type MetricLabelKey = keyof typeof METRIC_LABELS;
