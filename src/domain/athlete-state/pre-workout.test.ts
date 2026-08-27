import { describe, expect, it } from "vitest";
import {
  BODY_REGIONS,
  convergentAcuteFlags,
  isolatedLowRecovery,
  interpretMissingCheckin,
  safetyFromPain,
  shouldKeepSessionFromCheckin,
  skippedPreWorkoutCheckin,
  type PreWorkoutCheckin,
} from "./pre-workout";

function completed(overrides: Partial<PreWorkoutCheckin> = {}): PreWorkoutCheckin {
  return {
    status: "completed",
    sleepQuality: 4,
    energy: 4,
    muscleRecovery: 3,
    stress: 3,
    hasPain: false,
    painRegion: null,
    painIntensity: null,
    painWorsensWithMovement: null,
    painBlocksPlannedExercise: null,
    hasPlannedTime: true,
    availableMinutes: null,
    ...overrides,
  };
}

describe("Check-in Pré-Treino", () => {
  it("completo não reduz confiança", () => {
    const result = interpretMissingCheckin(completed());
    expect(result.acuteData).toBe("present");
    expect(result.reduceConfidence).toBe(false);
  });

  it("pulado não bloqueia e não assume recuperação normal", () => {
    const result = interpretMissingCheckin(skippedPreWorkoutCheckin());
    expect(result.acuteData).toBe("unknown");
    expect(result.treatAsNormalRecovery).toBe(false);
    expect(result.reduceConfidence).toBe(true);
  });

  it("dor abre fluxo de segurança sem diagnosticar", () => {
    const safety = safetyFromPain(
      completed({
        hasPain: true,
        painRegion: BODY_REGIONS[11],
        painIntensity: "forte",
        painWorsensWithMovement: true,
        painBlocksPlannedExercise: "sim",
      }),
    );
    expect(safety.activateRecoveryAndSafety).toBe(true);
    expect(safety.avoidExercise).toBe(true);
    expect(safety.diagnoseInjury).toBe(false);
  });

  it("recuperação baixa isolada não reduz o treino sozinha", () => {
    const checkin = completed({ sleepQuality: 1, energy: 4, muscleRecovery: 3, stress: 3 });
    expect(isolatedLowRecovery(checkin)).toBe(true);
    expect(
      shouldKeepSessionFromCheckin({
        checkin,
        recentPerformance: "progressing",
        recoveryHabitual: "normal",
      }),
    ).toBe(true);
  });

  it("múltiplos sinais agudos convergentes não pedem manter automaticamente", () => {
    const checkin = completed({ sleepQuality: 1, energy: 1, muscleRecovery: 1 });
    expect(convergentAcuteFlags(checkin)).toBe(true);
    expect(
      shouldKeepSessionFromCheckin({
        checkin,
        recentPerformance: "declining",
        recoveryHabitual: "below",
      }),
    ).toBe(false);
  });
});
