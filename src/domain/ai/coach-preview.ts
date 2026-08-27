import {
  emptyNutritionContext,
  isUnknown,
  type NutritionContext,
} from "@/domain/ai/nutrition-context";
import type { HeartRateContext } from "@/domain/heart-rate/context";
import { HEART_RATE_ANALYSIS_RULE } from "@/domain/heart-rate/context";

export type CoachKnownFacts = {
  benchPressKg: number | null;
  proposedBenchPressKg: number | null;
  repetitionsInReserve: number | null;
  recoveryLowerBodyBelowHabitual: boolean | null;
  lastTwoSessionsPerformanceDropped: boolean | null;
  nutrition: NutritionContext;
  heartRate: HeartRateContext | null;
};

export const previewCoachFacts: CoachKnownFacts = {
  benchPressKg: 80,
  proposedBenchPressKg: 82,
  repetitionsInReserve: 2,
  recoveryLowerBodyBelowHabitual: true,
  lastTwoSessionsPerformanceDropped: true,
  nutrition: emptyNutritionContext(),
  heartRate: null,
};

export const COACH_SUGGESTIONS = [
  "Como está minha evolução?",
  "Por que meu treino mudou?",
  "Posso substituir um exercício?",
  "Devo aumentar a carga?",
] as const;

export type CoachProposalStatus = "pending" | "accepted" | "kept";

export function requireKnownFacts(
  facts: CoachKnownFacts,
  keys: Exclude<keyof CoachKnownFacts, "nutrition" | "heartRate">[],
): { ok: true } | { ok: false; unknown: string[] } {
  const unknown: string[] = [];
  for (const key of keys) {
    if (facts[key] === null || facts[key] === undefined) {
      unknown.push(key);
    }
  }
  if (unknown.length > 0) {
    return { ok: false, unknown };
  }
  return { ok: true };
}

export type CoachIntegratedSections = {
  observacao: string;
  interpretacao: string;
  recomendacao: string;
  papelDaNutricao: string;
  proximaReavaliacao: string;
};

export type CoachPreviewMessage = {
  id: string;
  role: "coach" | "athlete";
  body: string;
  sections?: CoachIntegratedSections;
};

export function coachProposalFeedback(status: CoachProposalStatus): string | null {
  if (status === "accepted") {
    return "Alteração aceita. A próxima sessão de peito usa 82 kg no Supino Reto.";
  }
  if (status === "kept") {
    return "Carga mantida em 80 kg. Sem progressão nesta sessão.";
  }
  return null;
}

export function coachReplyForPrompt(
  prompt: string,
  facts: CoachKnownFacts,
): CoachPreviewMessage {
  const needed = requiredKeysForPrompt(prompt);
  const check = requireKnownFacts(facts, needed);
  if (!check.ok) {
    return {
      id: "unknown",
      role: "coach",
      body: `Não tenho dado suficiente para responder com segurança. Faltam: ${check.unknown.join(", ")}. UNKNOWN — não vou inventar.`,
    };
  }

  const nutritionRole = nutritionRoleCopy(facts.nutrition);
  const heartRateRole = heartRateRoleCopy(facts.heartRate);

  if (prompt.includes("evolução")) {
    return {
      id: "evolucao",
      role: "coach",
      body: `Sua evolução de força no Supino Reto está consistente: você fecha as séries com ${facts.repetitionsInReserve} repetições em reserva. Há margem para um aumento de 2 kg, sem pular o teto de 92% da frequência cardíaca máxima.${heartRateRole ? ` ${heartRateRole}` : ""}`,
      sections: {
        observacao: `Carga atual ${facts.benchPressKg} kg; ${facts.repetitionsInReserve} repetições em reserva.`,
        interpretacao: "Há margem de progressão hipertrófica sem comprometer a recuperação.",
        recomendacao: `Subir para ${facts.proposedBenchPressKg} kg na próxima sessão de peito.`,
        papelDaNutricao: nutritionRole,
        proximaReavaliacao: "Reavaliar carga e repetições em reserva na próxima sessão de peito.",
      },
    };
  }

  if (prompt.includes("treino mudou")) {
    return {
      id: "treino-mudou",
      role: "coach",
      body: `O volume de agachamento caiu porque a recuperação de membros inferiores está abaixo do habitual e o desempenho caiu nas duas últimas sessões. É um ajuste temporário, não uma troca de objetivo.${heartRateRole ? ` ${heartRateRole}` : ""}`,
      sections: {
        observacao:
          "Recuperação de membros inferiores abaixo do habitual; desempenho das duas últimas sessões em queda.",
        interpretacao: "Manter o volume planejado aumentaria o risco de fadiga acumulada.",
        recomendacao: "Reduzir volume temporariamente e reavaliar na próxima sessão de pernas.",
        papelDaNutricao: nutritionRole,
        proximaReavaliacao:
          "Reavaliar volume quando a recuperação de membros inferiores voltar ao habitual.",
      },
    };
  }

  if (prompt.includes("substituir")) {
    return {
      id: "substituir",
      role: "coach",
      body: "Substituição de exercício só entra se houver restrição, dor ou equipamento indisponível. No recorte atual não há fato desses — o plano permanece com os padrões já prescritos.",
    };
  }

  return {
    id: "carga",
    role: "coach",
    body: `Sim — o aumento de ${facts.benchPressKg} kg para ${facts.proposedBenchPressKg} kg no Supino Reto cabe no recorte atual, com ${facts.repetitionsInReserve} repetições em reserva. Aceite ou mantenha a carga na proposta abaixo.`,
  };
}

function nutritionRoleCopy(nutrition: NutritionContext): string {
  if (
    isUnknown(nutrition.behavior.nutritionAdherence) &&
    isUnknown(nutrition.energy.estimatedIntakeKcal) &&
    isUnknown(nutrition.protein.estimatedIntakeGrams)
  ) {
    return "UNKNOWN — adesão, energia e proteína estimadas não foram informadas neste recorte. A decisão de treino não inventa um ajuste calórico.";
  }
  const parts: string[] = [];
  if (!isUnknown(nutrition.behavior.nutritionAdherence)) {
    parts.push(`Adesão nutricional: ${nutrition.behavior.nutritionAdherence}.`);
  }
  if (!isUnknown(nutrition.energy.estimatedIntakeKcal)) {
    parts.push(`Energia estimada: ${nutrition.energy.estimatedIntakeKcal} kcal.`);
  }
  if (!isUnknown(nutrition.protein.estimatedIntakeGrams)) {
    parts.push(`Proteína estimada: ${nutrition.protein.estimatedIntakeGrams} g.`);
  }
  return parts.join(" ");
}

function heartRateRoleCopy(heartRate: HeartRateContext | null): string | null {
  if (!heartRate || !heartRate.enabled) return null;
  const trend = heartRate.recovery.trend;
  if (trend === "SLOWER") {
    return "A recuperação cardíaca entre séries ficou menos favorável nas sessões comparáveis; isso entra só como contexto, sem provar overtraining nem substituir carga, repetições ou esforço percebido.";
  }
  return "Sua resposta ao treinamento permanece consistente com as sessões recentes. Não há justificativa pelos dados atuais para alterar o planejamento com base isolada na frequência cardíaca.";
}

export { HEART_RATE_ANALYSIS_RULE };

function requiredKeysForPrompt(prompt: string): Exclude<keyof CoachKnownFacts, "nutrition" | "heartRate">[] {
  if (prompt.includes("evolução") || prompt.includes("carga")) {
    return ["benchPressKg", "proposedBenchPressKg", "repetitionsInReserve"];
  }
  if (prompt.includes("treino mudou")) {
    return ["recoveryLowerBodyBelowHabitual", "lastTwoSessionsPerformanceDropped"];
  }
  return [];
}
