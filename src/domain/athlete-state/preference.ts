import {
  DEFAULT_PRE_WORKOUT_CHECKIN_ENABLED,
  DEFAULT_WEEKLY_COACH_REVIEW_ENABLED,
  PRE_WORKOUT_PREFERENCE_KEY,
  WEEKLY_REVIEW_PREFERENCE_KEY,
} from "./types";

function parseEnabled(value: unknown, fallback: boolean): boolean {
  if (value === true || value === "true" || value === "1") return true;
  if (value === false || value === "false" || value === "0") return false;
  return fallback;
}

export function parsePreWorkoutCheckinEnabled(value: unknown): boolean {
  return parseEnabled(value, DEFAULT_PRE_WORKOUT_CHECKIN_ENABLED);
}

export function parseWeeklyCoachReviewEnabled(value: unknown): boolean {
  return parseEnabled(value, DEFAULT_WEEKLY_COACH_REVIEW_ENABLED);
}

export function preWorkoutPreferencePatch(enabled: boolean): {
  preferenceKey: typeof PRE_WORKOUT_PREFERENCE_KEY;
  preferenceValue: "true" | "false";
} {
  return {
    preferenceKey: PRE_WORKOUT_PREFERENCE_KEY,
    preferenceValue: enabled ? "true" : "false",
  };
}

export function weeklyReviewPreferencePatch(enabled: boolean): {
  preferenceKey: typeof WEEKLY_REVIEW_PREFERENCE_KEY;
  preferenceValue: "true" | "false";
} {
  return {
    preferenceKey: WEEKLY_REVIEW_PREFERENCE_KEY,
    preferenceValue: enabled ? "true" : "false",
  };
}
