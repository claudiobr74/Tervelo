import { describe, expect, it } from "vitest";
import {
  metricsForSet,
  recoveryDelta,
  recoveryTrend,
  sensorCoverage,
  sessionStats,
  setWindowsFromTimeline,
} from "./metrics";
import type { HeartRateSample, WorkoutTimelineEvent } from "./types";

function sample(id: string, at: string, bpm: number, valid = true): HeartRateSample {
  return {
    id,
    recordedAt: at,
    bpm,
    source: "web_bluetooth",
    isValid: valid,
    quality: valid ? "good" : "poor",
    qualityReason: valid ? null : "teste",
    exerciseId: "ex-1",
    setId: "set-1",
  };
}

describe("métricas de sessão", () => {
  it("calcula média, máxima, mínima e ignora inválidos", () => {
    const stats = sessionStats(
      [
        sample("a", "2026-08-26T10:00:00.000Z", 100),
        sample("b", "2026-08-26T10:00:01.000Z", 140),
        sample("c", "2026-08-26T10:00:02.000Z", 0, false),
      ],
      "2026-08-26T10:00:00.000Z",
      "2026-08-26T10:00:02.000Z",
    );
    expect(stats.sampleCount).toBe(2);
    expect(stats.averageBpm).toBe(120);
    expect(stats.maximumBpm).toBe(140);
    expect(stats.minimumBpm).toBe(100);
  });

  it("cobertura cai quando há lacunas longas", () => {
    const dense = sensorCoverage(
      [sample("a", "2026-08-26T10:00:00.000Z", 100), sample("b", "2026-08-26T10:00:02.000Z", 110)],
      "2026-08-26T10:00:00.000Z",
      "2026-08-26T10:00:02.000Z",
    );
    const gapped = sensorCoverage(
      [sample("a", "2026-08-26T10:00:00.000Z", 100), sample("b", "2026-08-26T10:00:20.000Z", 110)],
      "2026-08-26T10:00:00.000Z",
      "2026-08-26T10:00:20.000Z",
    );
    expect(dense).toBeGreaterThan(0.8);
    expect(gapped).toBeLessThan(0.5);
  });
});

describe("recuperação e associação temporal", () => {
  it("recuperação em 60s é pico menos bpm posterior", () => {
    expect(recoveryDelta(151, 119)).toBe(32);
    expect(recoveryDelta(151, null)).toBeNull();
  });

  it("associa samples à janela da série sem ação manual", () => {
    const events: WorkoutTimelineEvent[] = [
      { type: "SET_STARTED", at: "2026-08-26T10:00:00.000Z", setId: "s4", exerciseId: "ex" },
      { type: "SET_COMPLETED", at: "2026-08-26T10:00:40.000Z", setId: "s4", exerciseId: "ex" },
      { type: "REST_STARTED", at: "2026-08-26T10:00:40.000Z", setId: "s4", exerciseId: "ex" },
    ];
    const windows = setWindowsFromTimeline(events);
    expect(windows).toHaveLength(1);
    const metrics = metricsForSet(
      [
        sample("before", "2026-08-26T09:59:55.000Z", 106),
        sample("peak", "2026-08-26T10:00:20.000Z", 146),
        sample("end", "2026-08-26T10:00:40.000Z", 140),
        sample("r60", "2026-08-26T10:01:40.000Z", 118),
      ],
      windows[0],
    );
    expect(metrics.heartRateBeforeSet).toBe(106);
    expect(metrics.heartRatePeak).toBe(146);
    expect(metrics.heartRateAtSetEnd).toBe(140);
    expect(metrics.heartRateAfter60Seconds).toBe(118);
    expect(metrics.recovery60Seconds).toBe(28);
  });

  it("tendência de recuperação exige pelo menos três pontos", () => {
    expect(recoveryTrend([29, 28])).toBe("UNKNOWN");
    expect(recoveryTrend([30, 29, 28])).toBe("STABLE");
    expect(recoveryTrend([32, 31, 20])).toBe("SLOWER");
  });
});
