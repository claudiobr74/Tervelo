import type { SyncEntity } from "./types";

export const SYNC_PRIORITY = {
  training_session: 10,
  session_event: 15,
  set_result: 20,
  session_complete: 30,
  pre_workout_checkin: 40,
  post_workout_checkout: 41,
  heart_rate_sample_batch: 50,
  body_measurement: 60,
  nutrition_checkin: 70,
  nutrition_hydration: 71,
  nutrition_meal: 72,
  file_upload: 90,
} as const;

export function priorityFor(entity: SyncEntity, tipo?: string): number {
  if (tipo === "SESSION_COMPLETED" || tipo === "complete_session") {
    return SYNC_PRIORITY.session_complete;
  }
  return SYNC_PRIORITY[entity] ?? 80;
}
