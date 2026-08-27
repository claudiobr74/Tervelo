import type { OfflineCapability } from "./types";
import { SYNC_COPY } from "./labels";

export const FEATURE_CAPABILITY = {
  active_session: "OFFLINE_CRITICAL",
  set_results: "OFFLINE_CRITICAL",
  rest_timer: "OFFLINE_CRITICAL",
  pre_workout_checkin: "OFFLINE_CRITICAL",
  post_workout_checkout: "OFFLINE_CRITICAL",
  session_events: "OFFLINE_CRITICAL",
  connected_heart_rate: "OFFLINE_CRITICAL",
  complete_session: "OFFLINE_CRITICAL",
  synced_plan: "OFFLINE_SUPPORTED",
  recent_history: "OFFLINE_SUPPORTED",
  body_metrics: "OFFLINE_SUPPORTED",
  nutrition: "OFFLINE_SUPPORTED",
  basic_profile: "OFFLINE_SUPPORTED",
  session_library: "OFFLINE_SUPPORTED",
  remote_coach: "ONLINE_REQUIRED",
  program_generation: "ONLINE_REQUIRED",
  uncomputed_weekly_review: "ONLINE_REQUIRED",
  remote_exercise_search: "ONLINE_REQUIRED",
  admin: "ONLINE_REQUIRED",
  unsynced_other_device: "ONLINE_REQUIRED",
} as const satisfies Record<string, OfflineCapability>;

export function isOnlineRequired(feature: keyof typeof FEATURE_CAPABILITY): boolean {
  return FEATURE_CAPABILITY[feature] === "ONLINE_REQUIRED";
}

export function coachUnavailableCopy(): string {
  return SYNC_COPY.coachUnavailable;
}

export function pendingAnalysisCopy(): string {
  return SYNC_COPY.pendingAnalysis;
}
