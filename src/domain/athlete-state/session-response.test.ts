import { describe, expect, it } from "vitest";
import { buildSessionResponse, objectiveOutranksPerception } from "./session-response";
import type { ObjectiveSessionFacts } from "./session-response";

function objective(overrides: Partial<ObjectiveSessionFacts> = {}): ObjectiveSessionFacts {
  return {
    plannedSets: 10,
    completedSets: 10,
    plannedExercises: 4,
    completedExercises: 4,
    volumeKg: 5200,
    previousVolumeKg: 5000,
    loadProgressed: true,
    effortKnown: true,
    ...overrides,
  };
}

function build(overrides: Partial<Parameters<typeof buildSessionResponse>[0]> = {}) {
  return buildSessionResponse({
    checkin: null,
    checkout: null,
    objective: objective(),
    heartRateEnabled: false,
    heartRateSamples: 0,
    dataQuality: "ALTA",
    limitationPresent: false,
    timeAdapted: false,
    ...overrides,
  });
}

describe("buildSessionResponse", () => {
  it("classifica aderência pelo que foi realmente executado", () => {
    expect(build().adherence).toBe("completa");
    expect(build({ objective: objective({ completedSets: 9 }) }).adherence).toBe("completa");
    expect(build({ objective: objective({ completedSets: 6 }) }).adherence).toBe("parcial");
    expect(build({ objective: objective({ completedSets: 4 }) }).adherence).toBe("parcial");
    expect(build({ objective: objective({ completedSets: 3 }) }).adherence).toBe("nao_realizada");
    expect(build({ objective: objective({ completedSets: 0 }) }).adherence).toBe("nao_realizada");
  });

  it("não divide por zero quando não havia série planejada", () => {
    const response = build({ objective: objective({ plannedSets: 0, completedSets: 0 }) });
    expect(response.adherence).toBe("completa");
  });

  it("limita o escopo sugerido à sessão quando houve adaptação ou limitação", () => {
    expect(build().suggestedScope).toBe("SEM_MUDANCA");
    expect(build({ timeAdapted: true }).suggestedScope).toBe("AJUSTE_DA_SESSAO");
    expect(build({ limitationPresent: true }).suggestedScope).toBe("AJUSTE_DA_SESSAO");
    expect(build({ timeAdapted: true, limitationPresent: true }).suggestedScope).toBe("AJUSTE_DA_SESSAO");
  });

  it("só considera frequência cardíaca com aparelho ligado e amostras", () => {
    expect(build({ heartRateEnabled: true, heartRateSamples: 0 }).heartRateUsed).toBe(false);
    expect(build({ heartRateEnabled: false, heartRateSamples: 120 }).heartRateUsed).toBe(false);
    expect(build({ heartRateEnabled: true, heartRateSamples: 120 }).heartRateUsed).toBe(true);
  });

  it("mantém o dado objetivo acima da percepção", () => {
    expect(objectiveOutranksPerception(build())).toBe(true);
  });
});
