import type {
  AdherenceState,
  BodyDomainState,
  ChangeScope,
  ConfidenceLevel,
  DataQualityLevel,
  HeartRateDomainState,
  NutritionDomainState,
  OverallAthleteState,
  RecoveryDomainState,
  TrainingDomainState,
} from "./types";

export const PRODUCT_NAMES = {
  athleteState: "Estado do Atleta",
  athleteStateEngine: "Motor de Estado do Atleta",
  preWorkoutCheckin: "Check-in Pré-Treino",
  postWorkoutCheckout: "Check-out Pós-Treino",
  weeklyCoachReview: "Revisão Semanal do Coach",
  integratedCoach: "Coach Integrado",
  trainingArchitect: "Arquiteto de Treinamento",
  dailyCoach: "Coach do Treino",
  sportsNutritionCoach: "Coach de Nutrição Esportiva",
  progressAnalyst: "Analista de Progresso",
  bodyCompositionAnalyst: "Analista de Composição Corporal",
  recoveryAndSafety: "Recuperação e Segurança",
  dataQualityEngine: "Motor de Qualidade dos Dados",
  trendEngine: "Motor de Tendências",
  sessionResponse: "Resposta da Sessão",
  heartRateContext: "Contexto de Frequência Cardíaca",
  nutritionContext: "Contexto Nutricional",
  recovery: "Recuperação",
  nutrition: "Nutrição",
  bodyAndMeasures: "Corpo e Medidas",
  progress: "Progresso",
  coach: "Coach",
} as const;

export const OVERALL_STATE_COPY: Record<OverallAthleteState, string> = {
  CONSTRUINDO_REFERENCIA_INDIVIDUAL: "Aprendendo seu padrão",
  ESTAVEL: "Estável",
  PROGREDINDO: "Progredindo",
  RECUPERACAO_REDUZIDA: "Recuperação abaixo do habitual",
  DESEMPENHO_EM_QUEDA: "Desempenho em queda",
  REVISAO_NUTRICIONAL_NECESSARIA: "Revisão nutricional",
  REVISAO_DE_ADERENCIA_NECESSARIA: "Revisão de aderência",
  POSSIVEL_ESTAGNACAO: "Possível estagnação",
  LIMITACAO_PRESENTE: "Limitação presente",
  DADOS_INSUFICIENTES: "Dados insuficientes",
};

export const TRAINING_STATE_COPY: Record<TrainingDomainState, string> = {
  PROGREDINDO: "Progredindo",
  ESTAVEL: "Estável",
  EM_QUEDA: "Em queda",
  INDEFINIDO: "Indefinido",
};

export const RECOVERY_STATE_COPY: Record<RecoveryDomainState, string> = {
  NORMAL: "Normal",
  ABAIXO_DO_HABITUAL: "Abaixo do habitual",
  INDEFINIDO: "Indefinido",
};

export const NUTRITION_STATE_COPY: Record<NutritionDomainState, string> = {
  DENTRO_DO_PLANEJADO: "Dentro do planejado",
  ABAIXO_DO_PLANEJADO: "Abaixo do planejado",
  INDEFINIDO: "Indefinido",
};

export const BODY_STATE_COPY: Record<BodyDomainState, string> = {
  DENTRO_DO_OBJETIVO: "Dentro do objetivo",
  FORA_DO_OBJETIVO: "Fora do objetivo",
  INDEFINIDO: "Indefinido",
};

export const HEART_RATE_STATE_COPY: Record<HeartRateDomainState, string> = {
  ESTAVEL: "Estável",
  ALTERADA: "Alterada",
  INDEFINIDO: "Indefinido",
};

export const ADHERENCE_COPY: Record<AdherenceState, string> = {
  ALTA: "Alta",
  MODERADA: "Moderada",
  BAIXA: "Baixa",
  INDEFINIDO: "Indefinida",
};

export const CONFIDENCE_COPY: Record<ConfidenceLevel, string> = {
  ALTA: "Alta",
  MODERADA: "Moderada",
  BAIXA: "Baixa",
  INSUFICIENTE: "Insuficiente",
};

export const DATA_QUALITY_COPY: Record<DataQualityLevel, string> = {
  ALTA: "Alta",
  MODERADA: "Moderada",
  BAIXA: "Baixa",
  INSUFICIENTE: "Insuficiente",
};

export const CHANGE_SCOPE_COPY: Record<ChangeScope, string> = {
  SEM_MUDANCA: "Plano mantido",
  AJUSTE_DA_SESSAO: "Sessão adaptada",
  AJUSTE_DA_SEMANA: "Semana ajustada",
  ALTERACAO_DO_PROGRAMA: "Programa alterado",
};

export function overallStateCopy(state: OverallAthleteState): string {
  return OVERALL_STATE_COPY[state];
}

export function changeScopeCopy(scope: ChangeScope): string {
  return CHANGE_SCOPE_COPY[scope];
}

export function lowConfidenceCopy(signal: string): string {
  return `Há um possível sinal de ${signal}, mas ainda existem poucos dados para justificar mudança importante.`;
}
