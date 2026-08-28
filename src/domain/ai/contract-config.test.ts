import { describe, expect, it } from "vitest";
import {
  DEFAULT_AI_CONTRACT_CONFIG,
  parseAiContractConfig,
  testAiContract,
} from "./contract-config";

describe("contrato de IA persistível", () => {
  it("rejeita jsonb inválido e volta ao padrão do produto", () => {
    expect(parseAiContractConfig({ identity: "" })).toEqual(DEFAULT_AI_CONTRACT_CONFIG);
    expect(parseAiContractConfig(DEFAULT_AI_CONTRACT_CONFIG).selectedAgent).toBe("orchestrator");
  });

  it("testa o contrato sem fabricar atleta", () => {
    const result = testAiContract(DEFAULT_AI_CONTRACT_CONFIG);
    expect(result.valid).toBe(true);
    expect(result.athleteFacts).toBe("missing");
    expect(result.missingFields).toContain("atleta");
    expect(result.message).toMatch(/não inventa/);
  });
});
