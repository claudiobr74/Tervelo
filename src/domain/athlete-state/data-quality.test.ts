import { describe, expect, it } from "vitest";
import { assessDataQuality, confidenceFromQuality } from "./data-quality";

describe("Motor de Qualidade dos Dados", () => {
  it("alta com sessões comparáveis e aderência", () => {
    const result = assessDataQuality({
      sessionCount: 12,
      comparableSessions: 8,
      sameExercise: true,
      sameEquipment: true,
      gymChanged: false,
      missingFields: 0,
      recordAdherence: 0.9,
      anthropometryMethodChanged: false,
      weighInCount: 6,
      heartRateEnabled: false,
      heartRateCoverage: null,
      heartRateDeviceChanged: false,
      nutritionCoverage: 0.8,
      checkinCoverage: 0.8,
    });
    expect(result.nivel).toBe("ALTA");
  });

  it("insuficiente com poucas sessões", () => {
    const result = assessDataQuality({
      sessionCount: 1,
      comparableSessions: 0,
      sameExercise: false,
      sameEquipment: false,
      gymChanged: false,
      missingFields: 5,
      recordAdherence: 0.2,
      anthropometryMethodChanged: false,
      weighInCount: 0,
      heartRateEnabled: false,
      heartRateCoverage: null,
      heartRateDeviceChanged: false,
      nutritionCoverage: null,
      checkinCoverage: null,
    });
    expect(result.nivel).toBe("INSUFICIENTE");
  });

  it("check-in ausente reduz confiança", () => {
    expect(confidenceFromQuality("ALTA", { checkinMissing: true })).toBe("MODERADA");
    expect(confidenceFromQuality("MODERADA", { checkinMissing: true })).toBe("BAIXA");
  });
});
