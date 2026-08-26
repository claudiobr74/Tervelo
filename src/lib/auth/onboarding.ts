export const ONBOARDING_COOKIE = "terveloOnboarding";
export const ONBOARDING_STORAGE_KEY = "tervelo-onboarding";

export type SexOption = "male" | "female" | "other";
export type ExperienceOption = "lt6m" | "6m-2y" | "2-5y" | "gt5y";
export type GoalOption = "hypertrophy" | "fat_loss" | "recomp" | "strength";
export type PeriodOption = "morning" | "afternoon" | "evening";
export type Weekday = "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";

export type OnboardingDraft = {
  displayName: string;
  sex: SexOption | null;
  birthDate: string;
  heightCm: string;
  weightKg: string;
  chestCm: string;
  waistCm: string;
  hipCm: string;
  rightArmCm: string;
  leftArmCm: string;
  rightThighCm: string;
  leftThighCm: string;
  experience: ExperienceOption | null;
  comfortableFreeWeights: boolean;
  comfortableMachines: boolean;
  limitations: string;
  goal: GoalOption | null;
  days: Weekday[];
  sessionMinutes: number;
  mealsPerDay: 3 | 4 | 5 | 6;
  dietPattern: string;
  waterLiters: number;
  usesSupplements: boolean;
  supplements: string;
  preferredPeriod: PeriodOption | null;
  completed: boolean;
};

export const DEFAULT_ONBOARDING: OnboardingDraft = {
  displayName: "",
  sex: "male",
  birthDate: "",
  heightCm: "",
  weightKg: "",
  chestCm: "",
  waistCm: "",
  hipCm: "",
  rightArmCm: "",
  leftArmCm: "",
  rightThighCm: "",
  leftThighCm: "",
  experience: "6m-2y",
  comfortableFreeWeights: true,
  comfortableMachines: true,
  limitations: "",
  goal: "hypertrophy",
  days: ["seg", "ter", "qua", "qui", "sex"],
  sessionMinutes: 75,
  mealsPerDay: 4,
  dietPattern: "Sem restrições (Dieta Geral)",
  waterLiters: 3.5,
  usesSupplements: true,
  supplements: "",
  preferredPeriod: "morning",
  completed: false,
};

export const ONBOARDING_STEPS = [
  { href: "/onboarding/perfil", label: "Sobre você", step: 1 },
  { href: "/onboarding/medidas", label: "Suas medidas", step: 2 },
  { href: "/onboarding/experiencia", label: "Sua experiência", step: 3 },
  { href: "/onboarding/objetivos", label: "Seus objetivos", step: 4 },
  { href: "/onboarding/nutricao", label: "Alimentação e rotina", step: 5 },
] as const;
