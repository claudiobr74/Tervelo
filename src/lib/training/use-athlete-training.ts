"use client";

import { useEffect, useMemo } from "react";
import { bindWorkout } from "@/lib/training/bound-workout";
import { todaySessionId } from "@/lib/athlete/map-workout";
import { useAdminQuery } from "@/lib/admin/use-admin-query";
import type { AthleteSessionCard } from "@/lib/athlete/map-workout";
import type { WorkoutSession } from "@/domain/training/session";

type TrainingData = {
  sessions: AthleteSessionCard[];
  workouts: WorkoutSession[];
};

export function useAthleteTraining(requestedSessionId?: string | null) {
  const query = useAdminQuery<TrainingData>("/api/me/training");
  const sessions = query.data?.sessions ?? [];
  const workouts = query.data?.workouts ?? [];
  const todayId = todaySessionId(sessions);
  const activeId =
    requestedSessionId && workouts.some((item) => item.id === requestedSessionId)
      ? requestedSessionId
      : todayId;
  const workout = useMemo(
    () => workouts.find((item) => item.id === activeId) ?? null,
    [workouts, activeId],
  );
  const card = sessions.find((item) => item.id === activeId) ?? null;

  useEffect(() => {
    bindWorkout(workout);
  }, [workout]);

  return {
    ...query,
    sessions,
    workouts,
    workout,
    card,
    todayId,
  };
}
