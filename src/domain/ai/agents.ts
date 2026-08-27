export const AI_AGENTS = [
  { id: "orchestrator", label: "Orquestrador" },
  { id: "profiler", label: "Perfilador" },
  { id: "strength", label: "Força" },
  { id: "periodization", label: "Periodização" },
  { id: "nutrition", label: "Nutrição" },
  { id: "recovery", label: "Recuperação" },
  { id: "progress", label: "Evolução" },
  { id: "qa", label: "Controle de qualidade" },
] as const;

export type AiAgentId = (typeof AI_AGENTS)[number]["id"];

export const DEFAULT_AI_AGENT: AiAgentId = "orchestrator";

export const AI_AGENT_PIPELINE: readonly AiAgentId[] = [
  "orchestrator",
  "profiler",
  "recovery",
  "strength",
  "periodization",
  "nutrition",
  "progress",
  "qa",
];

export function isAiAgentId(value: string): value is AiAgentId {
  return AI_AGENTS.some((agent) => agent.id === value);
}

export function agentLabel(id: AiAgentId): string {
  return AI_AGENTS.find((agent) => agent.id === id)?.label ?? id;
}
