import type { WorkoutSession } from "@/domain/training/session";

/** Sem plano prescrito. O motor de execução não inventa Peitoral e Tríceps. */
export const PREVIEW_WORKOUT: WorkoutSession = {
  id: "no-prescribed-session",
  userId: "",
  title: "",
  focus: "",
  programLabel: "",
  estimatedMinutes: 0,
  status: "planned",
  exercises: [],
};
