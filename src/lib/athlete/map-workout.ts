import type { SessionExercise, WorkoutSession } from "@/domain/training/session";

export type TrainingGraphql = {
  training_programs: {
    id: string;
    title: string;
    status: string;
    started_on: string | null;
    source: string | null;
    updated_at: string;
  }[];
  training_blocks: {
    id: string;
    program_id: string;
    position: number;
    name: string | null;
    intent: string | null;
  }[];
  training_weeks: { id: string; block_id: string; week_index: number; notes: string | null }[];
  training_sessions: {
    id: string;
    week_id: string | null;
    gym_id: string | null;
    scheduled_at: string | null;
    started_at: string | null;
    completed_at: string | null;
    status: WorkoutSession["status"];
  }[];
  session_exercises: {
    id: string;
    session_id: string;
    position: number;
    rest_seconds: number | null;
    method_kind: string | null;
    notes: string | null;
    planned_equipment_id: string | null;
    exercise_variant_id: string | null;
  }[];
  exercise_sets: {
    id: string;
    session_exercise_id: string;
    set_index: number;
    target_reps_min: number | null;
    target_reps_max: number | null;
    target_weight_kg: number | string | null;
    target_reps_in_reserve: number | string | null;
  }[];
  exercise_variants: { id: string; canonical_exercise_id: string; name_pt: string }[];
  canonical_exercises: { id: string; name_pt: string }[];
};

function toNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export type AthleteSessionCard = {
  id: string;
  title: string;
  focus: string;
  programId: string | null;
  programLabel: string;
  scheduledAt: string | null;
  status: WorkoutSession["status"];
  exerciseCount: number;
};

export function mapAthleteSessions(data: TrainingGraphql): AthleteSessionCard[] {
  const workouts = mapWorkouts(data);
  const sessions = data.training_sessions;
  return sessions.map((session) => {
    const workout = workouts.find((item) => item.id === session.id);
    return {
      id: session.id,
      title: workout?.title || "Sessão",
      focus: workout?.focus ?? "",
      programId: programIdForSession(data, session.week_id),
      programLabel: workout?.programLabel ?? "",
      scheduledAt: session.scheduled_at,
      status: session.status,
      exerciseCount: workout?.exercises.length ?? 0,
    };
  });
}

function programIdForSession(data: TrainingGraphql, weekId: string | null): string | null {
  if (!weekId) return null;
  const week = data.training_weeks.find((item) => item.id === weekId);
  if (!week) return null;
  const block = data.training_blocks.find((item) => item.id === week.block_id);
  return block?.program_id ?? null;
}

export function mapWorkouts(data: TrainingGraphql): WorkoutSession[] {
  const variants = new Map(data.exercise_variants.map((item) => [item.id, item]));
  const canonical = new Map(data.canonical_exercises.map((item) => [item.id, item.name_pt]));
  const setsByExercise = new Map<string, TrainingGraphql["exercise_sets"]>();
  for (const set of data.exercise_sets) {
    const list = setsByExercise.get(set.session_exercise_id) ?? [];
    list.push(set);
    setsByExercise.set(set.session_exercise_id, list);
  }
  const exercisesBySession = new Map<string, SessionExercise[]>();
  for (const row of data.session_exercises) {
    const variant = row.exercise_variant_id ? variants.get(row.exercise_variant_id) : undefined;
    const namePt =
      row.notes?.trim() ||
      variant?.name_pt ||
      (variant ? canonical.get(variant.canonical_exercise_id) : undefined) ||
      "Exercício";
    const sets = (setsByExercise.get(row.id) ?? [])
      .slice()
      .sort((a, b) => a.set_index - b.set_index)
      .map((set) => ({
        id: set.id,
        setIndex: set.set_index,
        methodKind: (row.method_kind as SessionExercise["sets"][number]["methodKind"]) || "working",
        targetRepsMin: set.target_reps_min ?? 0,
        targetRepsMax: set.target_reps_max ?? set.target_reps_min ?? 0,
        targetWeightKg: toNumber(set.target_weight_kg),
        previousWeightKg: null,
        suggestedWeightKg: toNumber(set.target_weight_kg),
        targetRepsInReserve: toNumber(set.target_reps_in_reserve) ?? 2,
      }));
    const mapped: SessionExercise = {
      id: row.id,
      position: row.position,
      namePt,
      muscleGroup: "",
      restSeconds: row.rest_seconds ?? 90,
      methodKind: (row.method_kind as SessionExercise["methodKind"]) || "working",
      methodParams: {},
      groupId: null,
      plannedVariantId: row.exercise_variant_id ?? row.id,
      loadStepKg: 2.5,
      sets,
    };
    const list = exercisesBySession.get(row.session_id) ?? [];
    list.push(mapped);
    exercisesBySession.set(row.session_id, list);
  }

  return data.training_sessions.map((session) => {
    const week = session.week_id
      ? data.training_weeks.find((item) => item.id === session.week_id)
      : undefined;
    const block = week ? data.training_blocks.find((item) => item.id === week.block_id) : undefined;
    const program = block
      ? data.training_programs.find((item) => item.id === block.program_id)
      : undefined;
    const exercises = (exercisesBySession.get(session.id) ?? []).sort(
      (a, b) => a.position - b.position,
    );
    const restTotal = exercises.reduce(
      (sum, exercise) => sum + exercise.restSeconds * Math.max(exercise.sets.length, 1),
      0,
    );
    return {
      id: session.id,
      userId: "",
      title: program?.title || "Sessão",
      focus: block?.intent || block?.name || "",
      programLabel: program?.title ?? "",
      estimatedMinutes: Math.max(1, Math.round(restTotal / 60) + exercises.length * 4),
      status: session.status,
      exercises,
    };
  });
}

export function todaySessionId(
  sessions: {
    id: string;
    scheduledAt?: string | null;
    scheduled_at?: string | null;
    status: string;
  }[],
  now = new Date(),
): string | null {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const startMs = start.getTime();
  const endMs = end.getTime();
  const today = sessions.filter((session) => {
    const stampRaw = session.scheduledAt ?? session.scheduled_at;
    if (!stampRaw) return false;
    const stamp = Date.parse(stampRaw);
    return stamp >= startMs && stamp < endMs && session.status !== "skipped";
  });
  const open = today.find((session) => session.status !== "completed");
  return (open ?? today[0])?.id ?? null;
}
