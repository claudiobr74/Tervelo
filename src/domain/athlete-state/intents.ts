/** Intenções conceituais do Orquestrador. IDs internos em inglês; labels em PT-BR. */

export const ORCHESTRATOR_INTENTS = [
  { id: "ANALYZE_PRE_WORKOUT", label: "Analisar pré-treino" },
  { id: "ANALYZE_POST_WORKOUT", label: "Analisar pós-treino" },
  { id: "UPDATE_ATHLETE_STATE", label: "Atualizar estado do atleta" },
  { id: "GENERATE_WEEKLY_REVIEW", label: "Gerar revisão semanal" },
] as const;

export type OrchestratorIntentId = (typeof ORCHESTRATOR_INTENTS)[number]["id"];

export function orchestratorIntentLabel(id: OrchestratorIntentId): string {
  return ORCHESTRATOR_INTENTS.find((item) => item.id === id)?.label ?? id;
}

export function shouldCallAdvancedModel(input: {
  intent: OrchestratorIntentId;
  deterministicSufficient: boolean;
  nutritionStable: boolean;
  newBodyMeasurement: boolean;
}): boolean {
  if (input.deterministicSufficient) return false;
  if (input.intent === "ANALYZE_POST_WORKOUT" && input.deterministicSufficient) return false;
  if (input.intent === "UPDATE_ATHLETE_STATE") return false;
  if (input.intent === "GENERATE_WEEKLY_REVIEW") {
    return !input.nutritionStable || input.newBodyMeasurement;
  }
  return !input.deterministicSufficient;
}
