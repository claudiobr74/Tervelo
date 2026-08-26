import { describe, expect, it } from "vitest";
import { AI_AGENTS, DEFAULT_AI_AGENT, agentLabel, isAiAgentId } from "./agents";

describe("agentes de IA", () => {
  it("expõe nomes por extenso para a escolha no admin", () => {
    expect(AI_AGENTS.map((agent) => agent.id)).toEqual([
      "orchestrator",
      "profiler",
      "strength",
      "periodization",
      "nutrition",
      "recovery",
      "progress",
      "qa",
    ]);
    expect(agentLabel("qa")).toBe("Controle de qualidade");
    expect(agentLabel(DEFAULT_AI_AGENT)).toBe("Orquestrador");
  });

  it("recusa identificador que não é agente", () => {
    expect(isAiAgentId("orchestrator")).toBe(true);
    expect(isAiAgentId("gpt")).toBe(false);
  });
});
