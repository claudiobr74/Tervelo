import { describe, expect, it } from "vitest";
import { classifyAdherence, classifySlope, linearSlope, movingAverage, weightTrajectory } from "./trends";

describe("Motor de Tendências", () => {
  it("calcula média móvel e recusa janela curta", () => {
    expect(movingAverage([1, 2, 3, 4], 3)).toBe(3);
    expect(movingAverage([1, 2], 3)).toBeNull();
  });

  it("não deixa o modelo calcular série temporal: inclinação é determinística", () => {
    expect(linearSlope([10, 12, 14, 16])).toBeGreaterThan(0);
    expect(classifySlope(linearSlope([10, 10.01, 9.99, 10]))).toBe("stable");
    expect(weightTrajectory([82])).toBe("insufficient");
    expect(weightTrajectory([82, 81.8, 81.2, 80.4])).toBe("down");
  });

  it("classifica aderência", () => {
    expect(classifyAdherence(1)).toBe("ALTA");
    expect(classifyAdherence(0.7)).toBe("MODERADA");
    expect(classifyAdherence(0.2)).toBe("BAIXA");
    expect(classifyAdherence(null)).toBe("INDEFINIDO");
  });
});
