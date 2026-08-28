import { parseDecimalInRange } from "@/domain/athlete/decimal";

export type OnboardingAnswers = {
  displayName?: string;
  sex?: string | null;
  birthDate?: string;
  heightCm?: string;
  weightKg?: string;
  chestCm?: string;
  waistCm?: string;
  hipCm?: string;
  rightArmCm?: string;
  leftArmCm?: string;
  rightThighCm?: string;
  leftThighCm?: string;
  experience?: string | null;
  comfortableFreeWeights?: boolean;
  comfortableMachines?: boolean;
  limitations?: string;
  goal?: string | null;
  days?: string[];
  sessionMinutes?: number | string;
  mealsPerDay?: number | string;
  dietPattern?: string;
  waterLiters?: number | string;
  usesSupplements?: boolean;
  supplements?: string;
  preferredPeriod?: string | null;
};

export type BodyMeasurementInput = {
  weightKg: number | null;
  chestCm: number | null;
  waistCm: number | null;
  hipCm: number | null;
  leftArmCm: number | null;
  rightArmCm: number | null;
  leftThighCm: number | null;
  rightThighCm: number | null;
};

export type AthleteProfileInput = {
  displayName: string | null;
  birthDate: string | null;
  sex: string | null;
  heightCm: number | null;
  experienceLevel: string | null;
  availability: {
    days: string[];
    sessionMinutes: number | null;
    preferredPeriod: string | null;
    comfortableFreeWeights: boolean;
    comfortableMachines: boolean;
  };
  goalType: string | null;
  weightKg: number | null;
  measurements: BodyMeasurementInput;
  limitations: string | null;
  nutrition: {
    routine: string | null;
    restrictions: string | null;
    hydrationNotes: string | null;
  };
};

const SEX = new Set(["male", "female", "other"]);
const EXPERIENCE = new Set(["lt6m", "6m-2y", "2-5y", "gt5y"]);
const GOAL = new Set(["hypertrophy", "fat_loss", "recomp", "strength"]);
const PERIOD = new Set(["morning", "afternoon", "evening"]);
const WEEKDAY = new Set(["seg", "ter", "qua", "qui", "sex", "sab", "dom"]);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function enumOrNull(value: string | null | undefined, allowed: Set<string>): string | null {
  return typeof value === "string" && allowed.has(value) ? value : null;
}

function textOrNull(value: string | undefined, max = 2000): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

function asText(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  return value.slice(0, max);
}

function asBool(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function girth(value: string | undefined): number | null {
  return parseDecimalInRange(value, 20, 220);
}

/**
 * Aceita o JSON cru do cliente sem derrubar o cadastro por um campo
 * fora do tipo (rascunho antigo no aparelho, número como texto, etc.).
 */
export function coerceOnboardingAnswers(raw: unknown): OnboardingAnswers {
  if (!raw || typeof raw !== "object") return {};
  const value = raw as Record<string, unknown>;
  const days = Array.isArray(value.days)
    ? value.days.filter((day): day is string => typeof day === "string").slice(0, 7)
    : undefined;
  return {
    displayName: asText(value.displayName, 200),
    sex: asText(value.sex, 32) ?? null,
    birthDate: asText(value.birthDate, 32),
    heightCm: asText(value.heightCm, 32),
    weightKg: asText(value.weightKg, 32),
    chestCm: asText(value.chestCm, 32),
    waistCm: asText(value.waistCm, 32),
    hipCm: asText(value.hipCm, 32),
    rightArmCm: asText(value.rightArmCm, 32),
    leftArmCm: asText(value.leftArmCm, 32),
    rightThighCm: asText(value.rightThighCm, 32),
    leftThighCm: asText(value.leftThighCm, 32),
    experience: asText(value.experience, 32) ?? null,
    comfortableFreeWeights: asBool(value.comfortableFreeWeights),
    comfortableMachines: asBool(value.comfortableMachines),
    limitations: asText(value.limitations, 2000),
    goal: asText(value.goal, 32) ?? null,
    days,
    sessionMinutes:
      typeof value.sessionMinutes === "number" || typeof value.sessionMinutes === "string"
        ? value.sessionMinutes
        : undefined,
    mealsPerDay:
      typeof value.mealsPerDay === "number" || typeof value.mealsPerDay === "string"
        ? value.mealsPerDay
        : undefined,
    dietPattern: asText(value.dietPattern, 200),
    waterLiters:
      typeof value.waterLiters === "number" || typeof value.waterLiters === "string"
        ? value.waterLiters
        : undefined,
    usesSupplements: asBool(value.usesSupplements),
    supplements: asText(value.supplements, 500),
    preferredPeriod: asText(value.preferredPeriod, 32) ?? null,
  };
}

export function hasAnyBodyMeasurement(measurements: BodyMeasurementInput): boolean {
  return Object.values(measurements).some((value) => value !== null);
}

/** Converte o rascunho do onboarding no que o banco realmente guarda. */
export function athleteProfileInput(answers: OnboardingAnswers): AthleteProfileInput {
  const meals = parseDecimalInRange(answers.mealsPerDay, 1, 12);
  const water = parseDecimalInRange(answers.waterLiters, 0.5, 10);
  const routine = meals !== null ? `${meals} refeições por dia` : null;
  const supplements = answers.usesSupplements ? textOrNull(answers.supplements, 500) : null;
  const hydration =
    water !== null ? `Meta de ${water.toString().replace(".", ",")} litros por dia` : null;
  const weightKg = parseDecimalInRange(answers.weightKg, 20, 400);
  const measurements: BodyMeasurementInput = {
    weightKg,
    chestCm: girth(answers.chestCm),
    waistCm: girth(answers.waistCm),
    hipCm: girth(answers.hipCm),
    leftArmCm: girth(answers.leftArmCm),
    rightArmCm: girth(answers.rightArmCm),
    leftThighCm: girth(answers.leftThighCm),
    rightThighCm: girth(answers.rightThighCm),
  };

  return {
    displayName: textOrNull(answers.displayName, 200),
    birthDate: answers.birthDate && ISO_DATE.test(answers.birthDate) ? answers.birthDate : null,
    sex: enumOrNull(answers.sex, SEX),
    heightCm: parseDecimalInRange(answers.heightCm, 80, 260),
    experienceLevel: enumOrNull(answers.experience, EXPERIENCE),
    availability: {
      days: (answers.days ?? []).filter((day) => WEEKDAY.has(day)),
      sessionMinutes: parseDecimalInRange(answers.sessionMinutes, 10, 240),
      preferredPeriod: enumOrNull(answers.preferredPeriod, PERIOD),
      comfortableFreeWeights: answers.comfortableFreeWeights !== false,
      comfortableMachines: answers.comfortableMachines !== false,
    },
    goalType: enumOrNull(answers.goal, GOAL),
    weightKg,
    measurements,
    limitations: textOrNull(answers.limitations),
    nutrition: {
      routine,
      restrictions: textOrNull(answers.dietPattern, 200),
      hydrationNotes:
        [hydration, supplements ? `Suplementos: ${supplements}` : null]
          .filter(Boolean)
          .join(". ") || null,
    },
  };
}
