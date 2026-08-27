import { describe, expect, it } from "vitest";
import { buildHeartRateContext, emptyHeartRateContext, HEART_RATE_ANALYSIS_RULE } from "./context";
import type { HeartRateSample, SetHeartRateMetrics } from "./types";

function sample(bpm: number, at: string): HeartRateSample {
  return {
    id: at,
    recordedAt: at,
    bpm,
    source: "web_bluetooth",
    isValid: true,
    quality: "good",
    qualityReason: null,
    exerciseId: "ex",
    setId: "set",
  };
}

const metrics: SetHeartRateMetrics = {
  setId: "set",
  exerciseId: "ex",
  heartRateBeforeSet: 106,
  heartRatePeak: 146,
  heartRateAtSetEnd: 140,
  heartRateAfter30Seconds: 128,
  heartRateAfter60Seconds: 118,
  heartRateAfter90Seconds: 112,
  heartRateAfter120Seconds: 110,
  recovery60Seconds: 28,
};

describe("HEART_RATE_CONTEXT", () => {
  it("não gera contexto quando a preferência está desligada", () => {
    expect(
      buildHeartRateContext({
        heartRateEnabled: false,
        samples: [sample(118, "2026-08-26T10:00:00.000Z")],
        startedAt: "2026-08-26T10:00:00.000Z",
        endedAt: "2026-08-26T10:10:00.000Z",
        setMetrics: [metrics],
        sameDevice: true,
        comparableSessions: 4,
      }),
    ).toBeNull();
  });

  it("não gera contexto com poucos samples", () => {
    expect(
      buildHeartRateContext({
        heartRateEnabled: true,
        samples: [sample(118, "2026-08-26T10:00:00.000Z")],
        startedAt: "2026-08-26T10:00:00.000Z",
        endedAt: "2026-08-26T10:10:00.000Z",
        setMetrics: [metrics],
        sameDevice: true,
        comparableSessions: 1,
      }),
    ).toBeNull();
  });

  it("resume a sessão sem enviar a série temporal crua", () => {
    const samples = Array.from({ length: 12 }, (_, index) =>
      sample(
        110 + index,
        new Date(Date.parse("2026-08-26T10:00:00.000Z") + index * 1000).toISOString(),
      ),
    );
    const ctx = buildHeartRateContext({
      heartRateEnabled: true,
      samples,
      startedAt: "2026-08-26T10:00:00.000Z",
      endedAt: "2026-08-26T10:00:12.000Z",
      setMetrics: [metrics],
      sameDevice: true,
      comparableSessions: 4,
    });
    expect(ctx).not.toBeNull();
    expect(ctx?.enabled).toBe(true);
    expect(ctx?.session.averageBpm).toBeGreaterThan(100);
    expect(ctx?.session.coverage).not.toBeNull();
    expect(ctx?.recovery.median60Seconds).toBe(28);
    expect(JSON.stringify(ctx)).not.toContain("recordedAt");
    expect(emptyHeartRateContext().enabled).toBe(false);
    expect(HEART_RATE_ANALYSIS_RULE).toContain("informação complementar");
  });
});
