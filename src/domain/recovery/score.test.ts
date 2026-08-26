import { describe, expect, it } from "vitest";
import { DEFAULT_RECOVERY_SLIDERS } from "./score";
import {
  classifyRecovery,
  invertLoad,
  recoveryResultCopy,
  scoresFromSliders,
  sliderLabel,
} from "./score";

describe("score de recuperação", () => {
  it("inverte carga quando a direita do slider é o melhor", () => {
    expect(invertLoad(5)).toBe(1);
    expect(invertLoad(1)).toBe(5);
    expect(invertLoad(4)).toBe(2);
  });

  it("mapeia sliders padrão (4) para recuperação percebida Boa", () => {
    const scores = scoresFromSliders(DEFAULT_RECOVERY_SLIDERS);
    expect(scores.sleepQuality).toBe(4);
    expect(scores.energy).toBe(4);
    expect(scores.mood).toBe(4);
    expect(scores.muscleSoreness).toBe(2);
    expect(scores.discomfort).toBe(2);
    expect(scores.stress).toBe(2);
    expect(scores.perceivedRecovery).toBe(4);
    expect(classifyRecovery(scores.perceivedRecovery)).toBe("Boa");
    expect(recoveryResultCopy(4)).toContain("volume ideal");
  });

  it("usa os rótulos por extenso da ponta boa do Figma", () => {
    expect(sliderLabel("sleep", 5)).toBe("Excelente");
    expect(sliderLabel("energy", 5)).toBe("Alta");
    expect(sliderLabel("mood", 5)).toBe("Ótima");
    expect(sliderLabel("muscle", 5)).toBe("Sem dores (Recuperado)");
    expect(sliderLabel("pain", 5)).toBe("Não");
    expect(sliderLabel("stress", 5)).toBe("Baixo");
  });
});
