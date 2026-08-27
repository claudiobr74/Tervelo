import { parseDecimalInRange } from "@/domain/athlete/decimal";

export type OnboardingAnswers = {
  displayName?: string;
  sex?: string | null;
  birthDate?: string;
  heightCm?: string;
  weightKg?: string;
  experience?: string | null;
  comfortableFreeWeights?: boolean;
  comfortableMachines?: boolean;
  limitations?: string;
  goal?: string | null;
  days?: string[];
  sessionMinutes?: number;
  mealsPerDay?: number;
  dietPattern?: string;
  waterLiters?: number;
  usesSupplements?: boolean;
  supplements?: string;
  preferredPeriod?: string | null;
};

export type AthleteProfileInput = {
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

/** Converte o rascunho do onboarding no que o banco realmente guarda. */
export function athleteProfileInput(answers: OnboardingAnswers): AthleteProfileInput {
  const meals = answers.mealsPerDay;
  const water = answers.waterLiters;
  const routine =
    typeof meals === "number" && Number.isFinite(meals) ? `${meals} refeições por dia` : null;
  const supplements = answers.usesSupplements ? textOrNull(answers.supplements, 500) : null;
  const hydration =
    typeof water === "number" && Number.isFinite(water)
      ? `Meta de ${water.toString().replace(".", ",")} litros por dia`
      : null;

  return {
    birthDate: answers.birthDate && ISO_DATE.test(answers.birthDate) ? answers.birthDate : null,
    sex: enumOrNull(answers.sex, SEX),
    heightCm: parseDecimalInRange(answers.heightCm, 80, 260),
    experienceLevel: enumOrNull(answers.experience, EXPERIENCE),
    availability: {
      days: (answers.days ?? []).filter((day) => WEEKDAY.has(day)),
      sessionMinutes:
        typeof answers.sessionMinutes === "number" && Number.isFinite(answers.sessionMinutes)
          ? answers.sessionMinutes
          : null,
      preferredPeriod: enumOrNull(answers.preferredPeriod, PERIOD),
      comfortableFreeWeights: answers.comfortableFreeWeights !== false,
      comfortableMachines: answers.comfortableMachines !== false,
    },
    goalType: enumOrNull(answers.goal, GOAL),
    weightKg: parseDecimalInRange(answers.weightKg, 20, 400),
    limitations: textOrNull(answers.limitations),
    nutrition: {
      routine,
      restrictions: textOrNull(answers.dietPattern, 200),
      hydrationNotes: [hydration, supplements ? `Suplementos: ${supplements}` : null]
        .filter(Boolean)
        .join(". ") || null,
    },
  };
}
