import { describe, expect, it } from "vitest";
import { recoveryTrend } from "./trend";

const scores = {
  sleepQuality: 4,
  energy: 3,
  mood: 4,
  muscleSoreness: 2,
  discomfort: 1,
  stress: 2,
  perceivedRecovery: 4,
};

describe("tendência de recuperação", () => {
  it("recusa um único check-in como tendência", () => {
    const result = recoveryTrend(
      [{ id: "1", checkedInAt: new Date("2026-08-26T08:00:00Z"), ...scores }],
      new Date("2026-08-26T12:00:00Z"),
      7,
    );
    expect(result).toEqual({ ok: false, error: { code: "insufficient_history", sampleSize: 1 } });
  });

  it("agrega a janela com pelo menos 3 pontos", () => {
    const now = new Date("2026-08-26T12:00:00Z");
    const checkins = [1, 2, 3].map((day) => ({
      id: String(day),
      checkedInAt: new Date(`2026-08-2${day}T08:00:00Z`),
      ...scores,
      energy: day,
    }));
    const result = recoveryTrend(checkins, now, 7);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.sampleSize).toBe(3);
      expect(result.value.averages.energy).toBe(2);
    }
  });
});
