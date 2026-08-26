import { err, ok, type Result } from "../result";

export const AI_CONTRACT_STATES = ["draft", "testing", "published", "archived"] as const;
export type AiContractState = (typeof AI_CONTRACT_STATES)[number];

export type AthleteFacts = {
  userId: string;
  hasBirthDate: boolean;
  hasRecentMeasurement: boolean;
  hasProgram: boolean;
};

export type MissingFactsError = {
  code: "missing_data";
  fields: string[];
};

const FACT_LABEL: Record<keyof Omit<AthleteFacts, "userId">, string> = {
  hasBirthDate: "data de nascimento",
  hasRecentMeasurement: "medida corporal recente",
  hasProgram: "programa de treino",
};

/** Políticas críticas: não fabricar dados ausentes. */
export function requireKnownFacts(
  facts: AthleteFacts,
  required: readonly (keyof Omit<AthleteFacts, "userId">)[],
): Result<true, MissingFactsError> {
  const fields = required.filter((key) => !facts[key]).map((key) => FACT_LABEL[key]);
  if (fields.length > 0) {
    return err({ code: "missing_data", fields });
  }
  return ok(true);
}

export function isPublishedContract(state: AiContractState): boolean {
  return state === "published";
}

export function canPublishContract(role: string): boolean {
  return role === "super_admin";
}
