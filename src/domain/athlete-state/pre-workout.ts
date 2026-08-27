export const SLEEP_OPTIONS = [
  { value: 1, label: "Muito ruim" },
  { value: 2, label: "Ruim" },
  { value: 3, label: "Normal" },
  { value: 4, label: "Bom" },
  { value: 5, label: "Muito bom" },
] as const;

export const ENERGY_OPTIONS = [
  { value: 1, label: "Muito baixa" },
  { value: 2, label: "Baixa" },
  { value: 3, label: "Normal" },
  { value: 4, label: "Boa" },
  { value: 5, label: "Muito boa" },
] as const;

export const MUSCLE_RECOVERY_OPTIONS = [
  { value: 1, label: "Muito dolorido" },
  { value: 2, label: "Dolorido" },
  { value: 3, label: "Normal" },
  { value: 4, label: "Bem recuperado" },
] as const;

export const STRESS_OPTIONS = [
  { value: 1, label: "Muito alto" },
  { value: 2, label: "Alto" },
  { value: 3, label: "Normal" },
  { value: 4, label: "Baixo" },
] as const;

export const PAIN_INTENSITY_OPTIONS = [
  { value: "leve", label: "Leve" },
  { value: "moderada", label: "Moderada" },
  { value: "forte", label: "Forte" },
] as const;

export const YES_NO = [
  { value: false, label: "Não" },
  { value: true, label: "Sim" },
] as const;

export const BLOCKS_EXERCISE_OPTIONS = [
  { value: "nao", label: "Não" },
  { value: "sim", label: "Sim" },
  { value: "nao_sei", label: "Não sei" },
] as const;

export const BODY_REGIONS = [
  "Pescoço",
  "Ombro esquerdo",
  "Ombro direito",
  "Peito",
  "Costas",
  "Lombar",
  "Cotovelo esquerdo",
  "Cotovelo direito",
  "Punho esquerdo",
  "Punho direito",
  "Quadril",
  "Joelho esquerdo",
  "Joelho direito",
  "Tornozelo esquerdo",
  "Tornozelo direito",
  "Outro",
] as const;

export type PreWorkoutStatus = "completed" | "skipped";

export type PreWorkoutCheckin = {
  status: PreWorkoutStatus;
  sleepQuality: number | null;
  energy: number | null;
  muscleRecovery: number | null;
  stress: number | null;
  hasPain: boolean | null;
  painRegion: string | null;
  painIntensity: "leve" | "moderada" | "forte" | null;
  painWorsensWithMovement: boolean | null;
  painBlocksPlannedExercise: "nao" | "sim" | "nao_sei" | null;
  hasPlannedTime: boolean | null;
  availableMinutes: number | null;
};

export const EMPTY_PRE_WORKOUT: PreWorkoutCheckin = {
  status: "skipped",
  sleepQuality: null,
  energy: null,
  muscleRecovery: null,
  stress: null,
  hasPain: null,
  painRegion: null,
  painIntensity: null,
  painWorsensWithMovement: null,
  painBlocksPlannedExercise: null,
  hasPlannedTime: null,
  availableMinutes: null,
};

export function skippedPreWorkoutCheckin(): PreWorkoutCheckin {
  return { ...EMPTY_PRE_WORKOUT, status: "skipped" };
}

/** Check-in ausente não é recuperação normal — só reduz confiança. */
export function interpretMissingCheckin(checkin: PreWorkoutCheckin | null): {
  acuteData: "unknown" | "present";
  treatAsNormalRecovery: false;
  reduceConfidence: boolean;
} {
  if (!checkin || checkin.status === "skipped") {
    return { acuteData: "unknown", treatAsNormalRecovery: false, reduceConfidence: true };
  }
  return { acuteData: "present", treatAsNormalRecovery: false, reduceConfidence: false };
}

export function isolatedLowRecovery(checkin: PreWorkoutCheckin): boolean {
  if (checkin.status !== "completed") return false;
  const sleepLow = (checkin.sleepQuality ?? 3) <= 2;
  const energyLow = (checkin.energy ?? 3) <= 2;
  const muscleLow = (checkin.muscleRecovery ?? 3) <= 2;
  const stressHigh = (checkin.stress ?? 3) <= 2;
  const lows = [sleepLow, energyLow, muscleLow, stressHigh].filter(Boolean).length;
  return lows === 1;
}

export function convergentAcuteFlags(checkin: PreWorkoutCheckin): boolean {
  if (checkin.status !== "completed") return false;
  const sleepLow = (checkin.sleepQuality ?? 3) <= 2;
  const energyLow = (checkin.energy ?? 3) <= 2;
  const muscleLow = (checkin.muscleRecovery ?? 3) <= 2;
  return sleepLow && energyLow && muscleLow;
}

export function shouldKeepSessionFromCheckin(input: {
  checkin: PreWorkoutCheckin;
  recentPerformance: "unknown" | "stable" | "progressing" | "declining";
  recoveryHabitual: "unknown" | "normal" | "below";
}): boolean {
  if (input.checkin.status === "skipped") return true;
  if (isolatedLowRecovery(input.checkin) && input.recentPerformance !== "declining") return true;
  if (
    (input.checkin.sleepQuality ?? 3) <= 2 &&
    (input.checkin.energy ?? 3) >= 3 &&
    input.recentPerformance !== "declining" &&
    input.recoveryHabitual !== "below"
  ) {
    return true;
  }
  return !convergentAcuteFlags(input.checkin);
}

export type SafetyFromPain = {
  activateRecoveryAndSafety: boolean;
  avoidExercise: boolean;
  suggestSubstitution: boolean;
  diagnoseInjury: false;
  copy: string | null;
};

export function safetyFromPain(checkin: PreWorkoutCheckin): SafetyFromPain {
  if (checkin.status !== "completed" || checkin.hasPain !== true) {
    return {
      activateRecoveryAndSafety: false,
      avoidExercise: false,
      suggestSubstitution: false,
      diagnoseInjury: false,
      copy: null,
    };
  }
  const blocks = checkin.painBlocksPlannedExercise === "sim";
  const strong = checkin.painIntensity === "forte";
  return {
    activateRecoveryAndSafety: true,
    avoidExercise: blocks || strong,
    suggestSubstitution: blocks || checkin.painWorsensWithMovement === true,
    diagnoseInjury: false,
    copy: blocks
      ? "Há uma limitação hoje. Vamos evitar o movimento que piora o desconforto e preservar a sessão com alternativas seguras."
      : "Há desconforto hoje. A segurança da sessão vem antes da performance.",
  };
}
