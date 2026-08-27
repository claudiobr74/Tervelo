import { describe, expect, it } from "vitest";
import { adaptSessionForAvailableTime } from "./session-adaptation";

const exercises = [
  { id: "a", name: "Supino", priority: "primary" as const, sets: 4 },
  { id: "b", name: "Desenvolvimento", priority: "primary" as const, sets: 3 },
  { id: "c", name: "Tríceps", priority: "accessory" as const, sets: 3 },
  { id: "d", name: "Cardio", priority: "finisher" as const, sets: 1 },
];

describe("adaptação da sessão por tempo", () => {
  it("caso 5: 40 minutos adapta só a sessão atual", () => {
    const result = adaptSessionForAvailableTime({
      plannedMinutes: 75,
      availableMinutes: 40,
      exercises,
    });
    expect(result.scope).toBe("AJUSTE_DA_SESSAO");
    expect(result.affectsFutureProgram).toBe(false);
    expect(result.temporary).toBe(true);
    expect(result.dropped.some((item) => item.priority === "finisher")).toBe(true);
    expect(result.kept.some((item) => item.priority === "primary")).toBe(true);
    const proportional = exercises.map((item) => Math.round(item.sets * (40 / 75)));
    expect(result.kept.map((item) => item.sets)).not.toEqual(proportional.filter((_, index) => index < result.kept.length));
  });

  it("tempo suficiente não muda a sessão", () => {
    const result = adaptSessionForAvailableTime({
      plannedMinutes: 75,
      availableMinutes: 80,
      exercises,
    });
    expect(result.scope).toBe("SEM_MUDANCA");
    expect(result.dropped).toHaveLength(0);
  });
});
