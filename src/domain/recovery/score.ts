import type { RecoveryScores } from "./trend";

export const RECOVERY_SLIDER_MIN = 1;
export const RECOVERY_SLIDER_MAX = 5;

export type RecoverySliderKey = "sleep" | "energy" | "mood" | "muscle" | "pain" | "stress";

export type RecoverySliders = Record<RecoverySliderKey, number>;

export const DEFAULT_RECOVERY_SLIDERS: RecoverySliders = {
  sleep: 4,
  energy: 4,
  mood: 4,
  muscle: 4,
  pain: 4,
  stress: 4,
};

export const RECOVERY_QUESTIONS: {
  key: RecoverySliderKey;
  question: string;
  labels: readonly [string, string, string, string, string];
}[] = [
  {
    key: "sleep",
    question: "Como você dormiu?",
    labels: ["Péssimo", "Ruim", "Regular", "Bom", "Excelente"],
  },
  {
    key: "energy",
    question: "Como está sua energia?",
    labels: ["Muito baixa", "Baixa", "Moderada", "Boa", "Alta"],
  },
  {
    key: "mood",
    question: "Como está sua disposição para treinar?",
    labels: ["Muito baixa", "Baixa", "Regular", "Boa", "Ótima"],
  },
  {
    key: "muscle",
    question: "Como está sua musculatura?",
    labels: ["Muito dolorida", "Dolorida", "Moderada", "Pouca dor", "Sem dores (Recuperado)"],
  },
  {
    key: "pain",
    question: "Está sentindo alguma dor?",
    labels: ["Intensa", "Forte", "Moderada", "Leve", "Não"],
  },
  {
    key: "stress",
    question: "Como está seu nível de estresse?",
    labels: ["Muito alto", "Alto", "Moderado", "Leve", "Baixo"],
  },
];

export const RECOVERY_CLASSIFICATIONS = [
  "Ruim",
  "Regular",
  "Moderada",
  "Boa",
  "Excelente",
] as const;

export type RecoveryClassification = (typeof RECOVERY_CLASSIFICATIONS)[number];

function clampScore(value: number): number {
  return Math.min(RECOVERY_SLIDER_MAX, Math.max(RECOVERY_SLIDER_MIN, Math.round(value)));
}

/** Slider à direita = melhor. Dor, musculatura e estresse no domínio são carga (baixo = melhor). */
export function invertLoad(goodness: number): number {
  return RECOVERY_SLIDER_MAX + RECOVERY_SLIDER_MIN - clampScore(goodness);
}

export function sliderLabel(key: RecoverySliderKey, value: number): string {
  const question = RECOVERY_QUESTIONS.find((item) => item.key === key);
  return question?.labels[clampScore(value) - 1] ?? "";
}

export function scoresFromSliders(sliders: RecoverySliders): RecoveryScores {
  const goodness = [
    sliders.sleep,
    sliders.energy,
    sliders.mood,
    sliders.muscle,
    sliders.pain,
    sliders.stress,
  ].map(clampScore);
  const perceivedRecovery = clampScore(
    goodness.reduce((sum, value) => sum + value, 0) / goodness.length,
  );
  return {
    sleepQuality: goodness[0],
    energy: goodness[1],
    mood: goodness[2],
    muscleSoreness: invertLoad(goodness[3]),
    discomfort: invertLoad(goodness[4]),
    stress: invertLoad(goodness[5]),
    perceivedRecovery,
  };
}

export function classifyRecovery(score: number): RecoveryClassification {
  return RECOVERY_CLASSIFICATIONS[clampScore(score) - 1];
}

/** Mesma nota do check-in apresentada como porcentagem nos resumos. */
export function recoveryPercent(score: number): number {
  return Math.round((clampScore(score) / RECOVERY_SLIDER_MAX) * 100);
}

export function recoveryReadinessCopy(score: number): string {
  switch (clampScore(score)) {
    case 1:
      return "Priorize descanso hoje";
    case 2:
      return "Volume conservador hoje";
    case 3:
      return "Carga moderada hoje";
    case 4:
      return "Pronto para treinar";
    default:
      return "Pronto para alta carga";
  }
}

export function recoveryResultCopy(score: number): string {
  switch (clampScore(score)) {
    case 1:
      return "Seu plano de treino do dia foi adaptado para reduzir o volume.";
    case 2:
      return "Seu plano de treino do dia foi adaptado para um volume conservador.";
    case 3:
      return "Seu plano de treino do dia foi mantido com cautela no volume.";
    case 5:
      return "Seu plano de treino do dia permanece em volume ideal, com margem para progressão.";
    default:
      return "Seu plano de treino do dia foi adaptado e mantido em volume ideal.";
  }
}
