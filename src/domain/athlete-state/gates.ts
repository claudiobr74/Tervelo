import { DEFAULT_PRE_WORKOUT_CHECKIN_ENABLED, type AthleteStateInput } from "./types";

export function defaultAthleteStateInput(overrides: Partial<AthleteStateInput> = {}): AthleteStateInput {
  return {
    weeksOfHistory: 8,
    referenceWeeks: 3,
    sessionsCompleted: 16,
    sessionsPlanned: 16,
    recentPerformance: "stable",
    decliningSessionCount: 0,
    singleBadSession: false,
    isolatedBadNight: false,
    recoveryVsHabitual: "normal",
    sleepVsHabitual: "normal",
    energyVsHabitual: "normal",
    muscleRecoveryVsHabitual: "normal",
    perceivedExertionTrend: "stable",
    nutritionAdherence: "on_plan",
    energyIntakeVsTarget: "on_plan",
    weightTrend: "stable",
    waistTrend: "stable",
    skinfoldTrend: "stable",
    heartRateEnabled: false,
    heartRateVsHabitual: "unknown",
    hasLimitation: false,
    checkinPresent: true,
    checkoutPresent: true,
    availableMinutes: null,
    plannedMinutes: 75,
    dataQuality: "ALTA",
    gymChanged: false,
    equipmentChanged: false,
    anthropometryMethodChanged: false,
    heartRateDeviceChanged: false,
    ...overrides,
  };
}

export function shouldPromptPreWorkoutCheckin(input: {
  preferenceEnabled: boolean;
  alreadyCheckedIn: boolean;
  sessionAlreadyActive: boolean;
}): boolean {
  if (input.sessionAlreadyActive) return false;
  if (input.alreadyCheckedIn) return false;
  return input.preferenceEnabled ?? DEFAULT_PRE_WORKOUT_CHECKIN_ENABLED;
}

export { PRODUCT_ANALYTICS_EVENTS } from "./types";
