import type { WorkoutSession } from "@/domain/training/session";
import { PREVIEW_WORKOUT } from "@/lib/training/preview-workout";

let bound: WorkoutSession = PREVIEW_WORKOUT;

/** Sessão prescrita carregada do banco. Sem plano, permanece vazia. */
export function getBoundWorkout(): WorkoutSession {
  return bound;
}

export function bindWorkout(session: WorkoutSession | null): WorkoutSession {
  bound = session && session.exercises.length > 0 ? session : PREVIEW_WORKOUT;
  return bound;
}

export const previewWorkout = PREVIEW_WORKOUT;
