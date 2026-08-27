import { describe, expect, it } from "vitest";
import { parseHeartRateEnabled, heartRatePreferencePatch } from "./preference";
import { DEFAULT_HEART_RATE_ENABLED } from "./types";
import { auditHeartRateDecision, QA_HEART_RATE_CHECKS } from "./qa";

describe("preferência heart_rate_enabled", () => {
  it("nasce desligada", () => {
    expect(DEFAULT_HEART_RATE_ENABLED).toBe(false);
    expect(parseHeartRateEnabled(undefined)).toBe(false);
    expect(parseHeartRateEnabled("true")).toBe(true);
    expect(heartRatePreferencePatch(true)).toEqual({
      preferenceKey: "heart_rate_enabled",
      preferenceValue: "true",
    });
  });
});

describe("QA frequência cardíaca 21–30", () => {
  const clean = {
    heartRateEnabled: true,
    heartRateContextPresent: true,
    sufficientData: true,
    coverageAdequate: true,
    deviceChanged: false,
    usedOnlyAsContext: true,
    singleReadingDroveDecision: false,
    inferredMuscularEffortFromBpm: false,
    inferredDiagnosis: false,
    causalityWithoutSupport: false,
    trainingDataContradictsCardiacReading: false,
  };

  it("lista dez verificações", () => {
    expect(QA_HEART_RATE_CHECKS.map((item) => item.id)).toEqual([21, 22, 23, 24, 25, 26, 27, 28, 29, 30]);
  });

  it("passa no caminho integrado", () => {
    expect(auditHeartRateDecision(clean).ok).toBe(true);
  });

  it("falha se a IA usa BPM como esforço muscular ou diagnóstico", () => {
    expect(auditHeartRateDecision({ ...clean, inferredMuscularEffortFromBpm: true }).failedChecks).toContain(27);
    expect(auditHeartRateDecision({ ...clean, inferredDiagnosis: true }).failedChecks).toContain(28);
    expect(auditHeartRateDecision({ ...clean, singleReadingDroveDecision: true }).failedChecks).toContain(26);
  });
});
