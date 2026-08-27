export const EXPECTATION_OPTIONS = [
  { value: "muito_abaixo", label: "Muito abaixo" },
  { value: "abaixo", label: "Abaixo" },
  { value: "como_esperado", label: "Como esperado" },
  { value: "acima", label: "Acima" },
  { value: "muito_acima", label: "Muito acima" },
] as const;

export const DIFFICULTY_OPTIONS = [
  { value: "muito_facil", label: "Muito fácil" },
  { value: "facil", label: "Fácil" },
  { value: "adequada", label: "Adequada" },
  { value: "dificil", label: "Difícil" },
  { value: "muito_dificil", label: "Muito difícil" },
] as const;

export const PLAN_COMPLETION_OPTIONS = [
  { value: "sim", label: "Sim" },
  { value: "parcialmente", label: "Parcialmente" },
  { value: "nao", label: "Não" },
] as const;

export const PARTIAL_REASON_OPTIONS = [
  { value: "falta_de_tempo", label: "Falta de tempo" },
  { value: "equipamento_indisponivel", label: "Equipamento indisponível" },
  { value: "fadiga", label: "Fadiga" },
  { value: "dor_ou_desconforto", label: "Dor ou desconforto" },
  { value: "dificuldade_acima_do_esperado", label: "Dificuldade acima do esperado" },
  { value: "interrupcao_externa", label: "Interrupção externa" },
  { value: "outro", label: "Outro" },
] as const;

export type PostWorkoutStatus = "completed" | "skipped";
export type ExpectationValue = (typeof EXPECTATION_OPTIONS)[number]["value"];
export type DifficultyValue = (typeof DIFFICULTY_OPTIONS)[number]["value"];
export type PlanCompletionValue = (typeof PLAN_COMPLETION_OPTIONS)[number]["value"];
export type PartialReasonValue = (typeof PARTIAL_REASON_OPTIONS)[number]["value"];

export type PostWorkoutCheckout = {
  status: PostWorkoutStatus;
  expectation: ExpectationValue | null;
  difficulty: DifficultyValue | null;
  planCompletion: PlanCompletionValue | null;
  partialReasons: PartialReasonValue[];
  hadPain: boolean | null;
};

export const EMPTY_POST_WORKOUT: PostWorkoutCheckout = {
  status: "skipped",
  expectation: null,
  difficulty: null,
  planCompletion: null,
  partialReasons: [],
  hadPain: null,
};

export function skippedPostWorkoutCheckout(): PostWorkoutCheckout {
  return { ...EMPTY_POST_WORKOUT, status: "skipped" };
}

export function needsPartialReason(completion: PlanCompletionValue | null): boolean {
  return completion === "parcialmente" || completion === "nao";
}

/** Check-out captura percepção complementar — nunca carga, reps ou séries. */
export const CHECKOUT_FORBIDDEN_QUESTIONS = [
  "Qual carga utilizou?",
  "Quantas repetições realizou?",
  "Quantas séries fez?",
] as const;
