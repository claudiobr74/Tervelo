/** Contratos internos do Motor de Estado do Atleta. Copy de produto em `labels.ts`. */

export const ATHLETE_STATE_ALGORITHM_VERSION = "athlete-state-v1";

export const DEFAULT_REFERENCE_WEEKS = 3;
export const MIN_REFERENCE_WEEKS = 2;
export const MAX_REFERENCE_WEEKS = 4;

export const OVERALL_STATES = [
  "CONSTRUINDO_REFERENCIA_INDIVIDUAL",
  "ESTAVEL",
  "PROGREDINDO",
  "RECUPERACAO_REDUZIDA",
  "DESEMPENHO_EM_QUEDA",
  "REVISAO_NUTRICIONAL_NECESSARIA",
  "REVISAO_DE_ADERENCIA_NECESSARIA",
  "POSSIVEL_ESTAGNACAO",
  "LIMITACAO_PRESENTE",
  "DADOS_INSUFICIENTES",
] as const;

export type OverallAthleteState = (typeof OVERALL_STATES)[number];

export const CONFIDENCE_LEVELS = ["ALTA", "MODERADA", "BAIXA", "INSUFICIENTE"] as const;
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];

export const DATA_QUALITY_LEVELS = ["ALTA", "MODERADA", "BAIXA", "INSUFICIENTE"] as const;
export type DataQualityLevel = (typeof DATA_QUALITY_LEVELS)[number];

export const CHANGE_SCOPES = [
  "SEM_MUDANCA",
  "AJUSTE_DA_SESSAO",
  "AJUSTE_DA_SEMANA",
  "ALTERACAO_DO_PROGRAMA",
] as const;
export type ChangeScope = (typeof CHANGE_SCOPES)[number];

export const TRAINING_DOMAIN_STATES = ["PROGREDINDO", "ESTAVEL", "EM_QUEDA", "INDEFINIDO"] as const;
export type TrainingDomainState = (typeof TRAINING_DOMAIN_STATES)[number];

export const RECOVERY_DOMAIN_STATES = ["NORMAL", "ABAIXO_DO_HABITUAL", "INDEFINIDO"] as const;
export type RecoveryDomainState = (typeof RECOVERY_DOMAIN_STATES)[number];

export const NUTRITION_DOMAIN_STATES = ["DENTRO_DO_PLANEJADO", "ABAIXO_DO_PLANEJADO", "INDEFINIDO"] as const;
export type NutritionDomainState = (typeof NUTRITION_DOMAIN_STATES)[number];

export const BODY_DOMAIN_STATES = ["DENTRO_DO_OBJETIVO", "FORA_DO_OBJETIVO", "INDEFINIDO"] as const;
export type BodyDomainState = (typeof BODY_DOMAIN_STATES)[number];

export const HEART_RATE_DOMAIN_STATES = ["ESTAVEL", "ALTERADA", "INDEFINIDO"] as const;
export type HeartRateDomainState = (typeof HEART_RATE_DOMAIN_STATES)[number];

export const ADHERENCE_STATES = ["ALTA", "MODERADA", "BAIXA", "INDEFINIDO"] as const;
export type AdherenceState = (typeof ADHERENCE_STATES)[number];

export type DomainAssessment<TState extends string> = {
  estado: TState;
  confianca: ConfidenceLevel;
};

export type AthleteStateSnapshot = {
  estadoGeral: OverallAthleteState;
  treinamento: DomainAssessment<TrainingDomainState>;
  recuperacao: DomainAssessment<RecoveryDomainState>;
  nutricao: DomainAssessment<NutritionDomainState>;
  composicaoCorporal: DomainAssessment<BodyDomainState>;
  respostaCardiaca: DomainAssessment<HeartRateDomainState> & { habilitada: boolean };
  aderencia: { estado: AdherenceState };
  limitacoes: string[];
  alertas: string[];
  dadosAusentes: string[];
  motivos: string[];
  geradoEm: string;
  versaoAlgoritmo: typeof ATHLETE_STATE_ALGORITHM_VERSION;
  qualidadeDosDados: DataQualityLevel;
  periodoInicio: string | null;
  periodoFim: string | null;
};

export type SignalLevel = "unknown" | "normal" | "below" | "above";
export type PerformanceSignal = "unknown" | "stable" | "progressing" | "declining";
export type WeightSignal = "unknown" | "stable" | "falling_faster_than_plan" | "rising";
export type BodyTrendSignal = "unknown" | "stable" | "decreasing" | "increasing";

export type AthleteStateInput = {
  nowIso?: string;
  weeksOfHistory: number;
  referenceWeeks?: number;
  sessionsCompleted: number;
  sessionsPlanned: number;
  recentPerformance: PerformanceSignal;
  decliningSessionCount: number;
  singleBadSession: boolean;
  isolatedBadNight: boolean;
  recoveryVsHabitual: SignalLevel;
  sleepVsHabitual: SignalLevel;
  energyVsHabitual: SignalLevel;
  muscleRecoveryVsHabitual: SignalLevel;
  perceivedExertionTrend: "unknown" | "stable" | "rising";
  nutritionAdherence: "unknown" | "on_plan" | "below";
  energyIntakeVsTarget: "unknown" | "on_plan" | "below";
  weightTrend: WeightSignal;
  waistTrend: BodyTrendSignal;
  skinfoldTrend: BodyTrendSignal;
  heartRateEnabled: boolean;
  heartRateVsHabitual: "unknown" | "stable" | "changed";
  hasLimitation: boolean;
  checkinPresent: boolean;
  checkoutPresent: boolean;
  availableMinutes: number | null;
  plannedMinutes: number | null;
  dataQuality: DataQualityLevel;
  gymChanged: boolean;
  equipmentChanged: boolean;
  anthropometryMethodChanged: boolean;
  heartRateDeviceChanged: boolean;
};

export const PRE_WORKOUT_PREFERENCE_KEY = "pre_workout_checkin_enabled";
export const WEEKLY_REVIEW_PREFERENCE_KEY = "weekly_coach_review_enabled";
export const DEFAULT_PRE_WORKOUT_CHECKIN_ENABLED = true;
export const DEFAULT_WEEKLY_COACH_REVIEW_ENABLED = true;

export const PRODUCT_ANALYTICS_EVENTS = [
  "checkin_pre_treino_concluido",
  "checkin_pre_treino_pulado",
  "checkout_pos_treino_concluido",
  "revisao_semanal_aberta",
  "ajuste_do_coach_aceito",
] as const;

export type ProductAnalyticsEvent = (typeof PRODUCT_ANALYTICS_EVENTS)[number];
