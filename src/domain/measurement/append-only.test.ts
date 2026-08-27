import { describe, expect, it } from "vitest";
import { canUpdateMetrics, effectiveHistory, latestByTime } from "./append-only";

describe("histórico append-only", () => {
  it("não permite update de métricas de medidas e resultados", () => {
    expect(canUpdateMetrics("body_measurements")).toBe(false);
    expect(canUpdateMetrics("set_results")).toBe(false);
    expect(canUpdateMetrics("profiles")).toBe(true);
  });

  it("usa supersedes_id como correção, sem apagar o original da lista bruta", () => {
    const original = {
      id: "a",
      recordedAt: new Date("2026-01-01T00:00:00Z"),
      supersedesId: null,
    };
    const correction = {
      id: "b",
      recordedAt: new Date("2026-01-02T00:00:00Z"),
      supersedesId: "a",
    };
    const effective = effectiveHistory([original, correction]);
    expect(effective.map((row) => row.id)).toEqual(["b"]);
    expect(latestByTime([original, correction])?.id).toBe("b");
  });
});
