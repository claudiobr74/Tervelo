"use client";

import { useSyncExternalStore } from "react";
import {
  DEFAULT_PRE_WORKOUT_CHECKIN_ENABLED,
  DEFAULT_WEEKLY_COACH_REVIEW_ENABLED,
  PRE_WORKOUT_PREFERENCE_KEY,
  WEEKLY_REVIEW_PREFERENCE_KEY,
} from "@/domain/athlete-state/types";
import {
  parsePreWorkoutCheckinEnabled,
  parseWeeklyCoachReviewEnabled,
} from "@/domain/athlete-state/preference";

export const PRE_WORKOUT_PREF_STORAGE = "tervelo-pre-workout-checkin-enabled";
export const WEEKLY_REVIEW_PREF_STORAGE = "tervelo-weekly-coach-review-enabled";

const listeners = new Set<() => void>();
let preEnabled = DEFAULT_PRE_WORKOUT_CHECKIN_ENABLED;
let weeklyEnabled = DEFAULT_WEEKLY_COACH_REVIEW_ENABLED;
let hydrated = false;

function emit() {
  for (const listener of listeners) listener();
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  preEnabled = parsePreWorkoutCheckinEnabled(window.localStorage.getItem(PRE_WORKOUT_PREF_STORAGE));
  weeklyEnabled = parseWeeklyCoachReviewEnabled(window.localStorage.getItem(WEEKLY_REVIEW_PREF_STORAGE));
}

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PRE_WORKOUT_PREF_STORAGE, preEnabled ? "true" : "false");
  window.localStorage.setItem(WEEKLY_REVIEW_PREF_STORAGE, weeklyEnabled ? "true" : "false");
  emit();
}

export function getPreWorkoutCheckinEnabled(): boolean {
  hydrate();
  return preEnabled;
}

export function getWeeklyCoachReviewEnabled(): boolean {
  hydrate();
  return weeklyEnabled;
}

export function setPreWorkoutCheckinEnabled(enabled: boolean) {
  hydrate();
  preEnabled = enabled;
  persist();
}

export function setWeeklyCoachReviewEnabled(enabled: boolean) {
  hydrate();
  weeklyEnabled = enabled;
  persist();
}

export function subscribeAthleteStatePrefs(listener: () => void): () => void {
  hydrate();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function usePreWorkoutCheckinEnabled(): boolean {
  return useSyncExternalStore(subscribeAthleteStatePrefs, getPreWorkoutCheckinEnabled, () => DEFAULT_PRE_WORKOUT_CHECKIN_ENABLED);
}

export function useWeeklyCoachReviewEnabled(): boolean {
  return useSyncExternalStore(subscribeAthleteStatePrefs, getWeeklyCoachReviewEnabled, () => DEFAULT_WEEKLY_COACH_REVIEW_ENABLED);
}

export { PRE_WORKOUT_PREFERENCE_KEY, WEEKLY_REVIEW_PREFERENCE_KEY };
