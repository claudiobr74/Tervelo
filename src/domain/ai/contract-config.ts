import { z } from "zod";
import { DEFAULT_AI_AGENT, isAiAgentId, type AiAgentId } from "./agents";
import {
  AI_AUTONOMY_ACTIONS,
  AI_IDENTITY_PROMPT,
  AI_TONES,
  DEFAULT_AI_AUTONOMY,
  DEFAULT_AI_TONES,
  type AiAutonomyActionId,
  type AiAutonomyLevel,
  type AiTone,
} from "./contract";
import { requireKnownFacts, type AthleteFacts } from "./facts";

const toneSchema = z.enum(["Técnico", "Didático", "Motivacional", "Conciso"]);
const autonomyLevelSchema = z.enum(["sugerir", "confirmar", "auto"]);

const autonomySchema = z.object({
  load_progression: autonomyLevelSchema,
  training_volume: autonomyLevelSchema,
  exercise_substitution: autonomyLevelSchema,
  nutrition_adjustment: autonomyLevelSchema,
});

export const aiContractConfigSchema = z.object({
  identity: z.string().min(1).max(8_000),
  selectedAgent: z.string().refine(isAiAgentId),
  tones: z.array(toneSchema).min(1).max(4),
  autonomy: autonomySchema,
  training: z.object({
    loadProgression: z.string().max(2_000),
    volume: z.string().max(2_000),
    intensity: z.string().max(2_000),
    proximityToFailure: z.string().max(2_000),
    deload: z.string().max(2_000),
    frequency: z.string().max(2_000),
  }),
  nutrition: z.object({
    considerBeforeVolumeCut: z.boolean(),
    unknownStaysUnknown: z.boolean(),
  }),
  recovery: z.object({
    heartRateComplementary: z.boolean(),
  }),
  models: z.object({
    primary: z.string().min(1).max(120),
  }),
});

export type AiContractConfig = z.infer<typeof aiContractConfigSchema>;

export const DEFAULT_AI_CONTRACT_CONFIG: AiContractConfig = {
  identity: AI_IDENTITY_PROMPT,
  selectedAgent: DEFAULT_AI_AGENT,
  tones: [...DEFAULT_AI_TONES],
  autonomy: { ...DEFAULT_AI_AUTONOMY },
  training: {
    loadProgression:
      "Progressão só com evidência longitudinal. Sem fabricar carga ausente. Autonomia segue a matriz.",
    volume:
      "Volume sobe ou desce pela menor alteração necessária. Nutrição relevante entra antes de cortar volume.",
    intensity: "Intensidade nunca ignora fadiga biomecânica nem as regras protegidas de segurança.",
    proximityToFailure: "Proximidade da falha permanece UNKNOWN sem séries registradas.",
    deload: "Deload só com janela de tendência, não com um ponto único.",
    frequency: "Frequência semanal não muda por um check-in isolado.",
  },
  nutrition: {
    considerBeforeVolumeCut: true,
    unknownStaysUnknown: true,
  },
  recovery: {
    heartRateComplementary: true,
  },
  models: {
    primary: "servidor",
  },
};

export const AI_CONTRACT_SLUG = "default-athlete-coach";

export function parseAiContractConfig(raw: unknown): AiContractConfig {
  const parsed = aiContractConfigSchema.safeParse(raw);
  if (!parsed.success) return DEFAULT_AI_CONTRACT_CONFIG;
  return parsed.data;
}

export function mergeAiContractConfig(partial: Partial<AiContractConfig>): AiContractConfig {
  return parseAiContractConfig({
    ...DEFAULT_AI_CONTRACT_CONFIG,
    ...partial,
    autonomy: { ...DEFAULT_AI_CONTRACT_CONFIG.autonomy, ...partial.autonomy },
    training: { ...DEFAULT_AI_CONTRACT_CONFIG.training, ...partial.training },
    nutrition: { ...DEFAULT_AI_CONTRACT_CONFIG.nutrition, ...partial.nutrition },
    recovery: { ...DEFAULT_AI_CONTRACT_CONFIG.recovery, ...partial.recovery },
    models: { ...DEFAULT_AI_CONTRACT_CONFIG.models, ...partial.models },
    tones: partial.tones ?? DEFAULT_AI_CONTRACT_CONFIG.tones,
  });
}

export function isAiTone(value: string): value is AiTone {
  return (AI_TONES as readonly string[]).includes(value);
}

export function isAiAutonomyAction(value: string): value is AiAutonomyActionId {
  return AI_AUTONOMY_ACTIONS.some((action) => action.id === value);
}

export function isAiAutonomyLevel(value: string): value is AiAutonomyLevel {
  return value === "sugerir" || value === "confirmar" || value === "auto";
}

export type AiContractTestResult = {
  valid: boolean;
  selectedAgent: AiAgentId;
  athleteFacts: "known" | "missing";
  missingFields: string[];
  message: string;
};

/** Teste real do contrato: valida config e recusa fabricar atleta. */
export function testAiContract(
  config: AiContractConfig,
  facts: AthleteFacts | null = null,
): AiContractTestResult {
  const parsed = aiContractConfigSchema.safeParse(config);
  if (!parsed.success) {
    return {
      valid: false,
      selectedAgent: DEFAULT_AI_AGENT,
      athleteFacts: "missing",
      missingFields: parsed.error.issues.map((issue) => issue.path.join(".") || "config"),
      message: "O contrato enviado não passou na validação.",
    };
  }
  if (!facts) {
    return {
      valid: true,
      selectedAgent: parsed.data.selectedAgent,
      athleteFacts: "missing",
      missingFields: ["atleta"],
      message:
        "Contrato válido. Sem fatos de um atleta no pedido, a orquestração não inventa treino, carga nem nutrição.",
    };
  }
  const required = requireKnownFacts(facts, ["hasBirthDate", "hasProgram"]);
  if (!required.ok) {
    return {
      valid: true,
      selectedAgent: parsed.data.selectedAgent,
      athleteFacts: "missing",
      missingFields: required.error.fields,
      message: `Contrato válido. Fatos ausentes: ${required.error.fields.join(", ")}.`,
    };
  }
  return {
    valid: true,
    selectedAgent: parsed.data.selectedAgent,
    athleteFacts: "known",
    missingFields: [],
    message: "Contrato válido. Orquestração com modelo permanece no servidor, sem fabricar dados.",
  };
}
