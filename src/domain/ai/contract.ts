export const AI_IDENTITY_PROMPT =
  "Você é o Coach de IA do Tervelo. Auxilia atletas a atingirem hipertrofia mantendo sua segurança física como prioridade número 1. Ajuste cargas baseando-se no feedback de fadiga do dia.";

export const AI_GLOBAL_PRIORITIES = [
  "1. Segurança Física contra Lesões",
  "2. Aderência ao Cronograma de Treino",
  "3. Evolução de Carga Controlada",
  "4. Performance Esportiva Pura",
] as const;

export const AI_TONES = ["Técnico", "Didático", "Motivacional", "Conciso"] as const;
export type AiTone = (typeof AI_TONES)[number];

export const DEFAULT_AI_TONES: readonly AiTone[] = ["Técnico", "Motivacional"];

export const AI_AUTONOMY_LEVELS = ["sugerir", "confirmar", "auto"] as const;
export type AiAutonomyLevel = (typeof AI_AUTONOMY_LEVELS)[number];

export const AI_AUTONOMY_LEVEL_LABEL: Record<AiAutonomyLevel, string> = {
  sugerir: "Sugerir",
  confirmar: "Confirmar",
  auto: "Auto",
};

export const AI_AUTONOMY_ACTIONS = [
  { id: "load_progression", label: "Progressão de carga" },
  { id: "training_volume", label: "Volume de treino" },
  { id: "exercise_substitution", label: "Substituição de exercício" },
  { id: "nutrition_adjustment", label: "Ajuste nutricional" },
] as const;

export type AiAutonomyActionId = (typeof AI_AUTONOMY_ACTIONS)[number]["id"];

export const DEFAULT_AI_AUTONOMY: Record<AiAutonomyActionId, AiAutonomyLevel> = {
  load_progression: "confirmar",
  training_volume: "auto",
  exercise_substitution: "sugerir",
  nutrition_adjustment: "confirmar",
};

/** Regras visíveis no card do Figma — travadas no código, não no jsonb. */
export const AI_SYSTEM_LOCKS = [
  "Frequência cardíaca limite nunca deve exceder 92% do calculado.",
  "Bloqueio total de treinos se fadiga biomecânica estiver acima de 95%.",
] as const;

/** Políticas que o contrato configurável não pode desligar. */
export const AI_POLICY_LOCKS = [
  "Não fabricar dados ausentes; memória vem do banco.",
  "Tendências exigem janela (pelo menos 3 pontos), não um ponto único.",
  "Histórico longitudinal é append-only.",
  "Publicar contrato só com papel super_admin.",
  "Sem chain-of-thought em ai_decisions (só racional curto objetivo).",
  "Isolamento por user_id. Rate limit na Function.",
  "Dados ausentes permanecem UNKNOWN; nunca estimar silenciosamente.",
  "Treino e nutrição não se interpretam isoladamente quando há dados relevantes nos dois.",
  "Frequência cardíaca é complementar; nunca determina sozinha carga, volume, falha, deload, hipertrofia, fadiga ou diagnóstico.",
  "Não comprimir o Estado do Atleta em uma nota de prontidão 0 a 100.",
  "Check-in diário não gera alteração permanente de programa sem evidência longitudinal.",
  "Orçamento de Mudanças: a menor alteração necessária.",
  "Não afirmar causalidade quando existe apenas associação.",
] as const;

export const AI_ADMIN_TABS = [
  { id: "behavior", label: "Comportamento" },
  { id: "training", label: "Treinamento" },
  { id: "nutrition", label: "Nutrição" },
  { id: "recovery", label: "Recuperação" },
  { id: "safety", label: "Segurança" },
  { id: "models", label: "Modelos" },
  { id: "tests", label: "Testes" },
  { id: "versioning", label: "Versionamento" },
] as const;

export type AiAdminTabId = (typeof AI_ADMIN_TABS)[number]["id"];

export const DEFAULT_AI_ADMIN_TAB: AiAdminTabId = "behavior";

export const AI_CONTRACT_PREVIEW = {
  slug: "default-athlete-coach",
  version: "sem versão",
  stateLabel: "sem versão no banco",
} as const;
