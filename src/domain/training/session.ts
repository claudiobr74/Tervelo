import type { ExerciseSubstitution, MethodKind } from "./hierarchy";

export type SetPrescription = {
  id: string;
  setIndex: number;
  methodKind: MethodKind;
  targetRepsMin: number;
  targetRepsMax: number;
  targetWeightKg: number | null;
  previousWeightKg: number | null;
  suggestedWeightKg: number | null;
  targetRepsInReserve: number;
  weightLabel?: string;
};

export type SessionExercise = {
  id: string;
  position: number;
  namePt: string;
  muscleGroup: string;
  imageSrc?: string;
  restSeconds: number;
  methodKind: MethodKind;
  methodParams: Record<string, unknown>;
  groupId: string | null;
  plannedVariantId: string;
  loadStepKg: number;
  previousLabel?: string;
  suggestedLabel?: string;
  sets: SetPrescription[];
};

export type WorkoutSession = {
  id: string;
  userId: string;
  title: string;
  focus: string;
  programLabel: string;
  estimatedMinutes: number;
  status: "planned" | "in_progress" | "completed" | "skipped";
  exercises: SessionExercise[];
};

export type RecordedSet = {
  setId: string;
  sessionExerciseId: string;
  clientMutationId: string;
  weightKg: number | null;
  reps: number;
  repsInReserve: number | null;
  methodKind: MethodKind;
  performedAt: string;
};

export type FlattenedSet = {
  exercise: SessionExercise;
  set: SetPrescription;
};

export type LiveCursor = {
  exerciseIndex: number;
  setIndex: number;
  flattenIndex: number;
};

export const METHOD_LABELS: Record<MethodKind, string> = {
  warmup: "Aquecimento",
  working: "Trabalho",
  backoff: "Back-off",
  superset: "Supersérie",
  triset: "Trissérie",
  giant_set: "Giant set",
  circuit: "Circuito",
  drop_set: "Drop-set",
  rest_pause: "Rest-pause",
  cluster: "Cluster",
  myo_reps: "Myo-reps",
  pause: "Pausa",
  tempo: "Tempo",
  isometric: "Isometria",
};

export function workingSets(exercise: SessionExercise): SetPrescription[] {
  return exercise.sets.filter((set) => set.methodKind !== "warmup");
}

export function warmupSets(exercise: SessionExercise): SetPrescription[] {
  return exercise.sets.filter((set) => set.methodKind === "warmup");
}

export function formatSetsAndReps(exercise: SessionExercise): string {
  const sets = workingSets(exercise);
  if (sets.length === 0) return "—";
  const first = sets[0];
  const range =
    first.targetRepsMin === first.targetRepsMax
      ? String(first.targetRepsMin)
      : `${first.targetRepsMin}-${first.targetRepsMax}`;
  return `${sets.length} × ${range}`;
}

export function formatRest(seconds: number): string {
  if (seconds % 60 === 0) return `${seconds / 60} min`;
  return `${seconds}s`;
}

export function formatKg(value: number | null, fallback?: string): string {
  if (value == null) return fallback ?? "—";
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}kg`;
}

/** Substituição pontual não reescreve a sessão/programa. */
export function applySessionExerciseSubstitution(
  session: WorkoutSession,
  substitution: ExerciseSubstitution,
): WorkoutSession {
  void substitution;
  return session;
}

/** Intercala parceiros de supersérie por round; aquecimentos primeiro. */
export function flattenSession(session: WorkoutSession): FlattenedSet[] {
  const result: FlattenedSet[] = [];
  const used = new Set<string>();
  for (const exercise of session.exercises) {
    if (used.has(exercise.id)) continue;
    const group = exercise.groupId
      ? session.exercises.filter((item) => item.groupId === exercise.groupId)
      : [exercise];
    for (const member of group) used.add(member.id);

    const warmups: FlattenedSet[] = [];
    const workByRound: FlattenedSet[][] = [];
    for (const member of group) {
      let workIndex = 0;
      for (const set of member.sets) {
        if (set.methodKind === "warmup") {
          warmups.push({ exercise: member, set });
        } else {
          if (!workByRound[workIndex]) workByRound[workIndex] = [];
          workByRound[workIndex].push({ exercise: member, set });
          workIndex += 1;
        }
      }
    }
    result.push(...warmups, ...workByRound.flat());
  }
  return result;
}

function indexesFor(session: WorkoutSession, item: FlattenedSet): Omit<LiveCursor, "flattenIndex"> {
  return {
    exerciseIndex: session.exercises.findIndex((exercise) => exercise.id === item.exercise.id),
    setIndex: item.exercise.sets.findIndex((set) => set.id === item.set.id),
  };
}

export function findCursor(session: WorkoutSession, recorded: RecordedSet[]): LiveCursor {
  const items = flattenSession(session);
  const done = new Set(recorded.map((row) => row.setId));
  const flattenIndex = items.findIndex((item) => !done.has(item.set.id));
  if (flattenIndex < 0) {
    const last = items.at(-1);
    if (!last) return { exerciseIndex: 0, setIndex: 0, flattenIndex: 0 };
    return { ...indexesFor(session, last), flattenIndex: items.length };
  }
  return { ...indexesFor(session, items[flattenIndex]), flattenIndex };
}

export function hasSessionWork(session: WorkoutSession): boolean {
  return flattenSession(session).length > 0;
}

export function isSessionComplete(session: WorkoutSession, recorded: RecordedSet[]): boolean {
  const total = flattenSession(session).length;
  return total > 0 && recorded.length >= total;
}

export function currentExercise(session: WorkoutSession, recorded: RecordedSet[]): SessionExercise {
  return session.exercises[findCursor(session, recorded).exerciseIndex];
}

export function currentSet(session: WorkoutSession, recorded: RecordedSet[]): SetPrescription {
  const cursor = findCursor(session, recorded);
  return session.exercises[cursor.exerciseIndex].sets[cursor.setIndex];
}

function locateSet(
  session: WorkoutSession,
  setId: string,
): { exercise: SessionExercise; set: SetPrescription } | null {
  for (const exercise of session.exercises) {
    const set = exercise.sets.find((item) => item.id === setId);
    if (set) return { exercise, set };
  }
  return null;
}

export function nextPrescription(
  session: WorkoutSession,
  recorded: RecordedSet[],
): SetPrescription | null {
  if (isSessionComplete(session, recorded)) return null;
  return currentSet(session, recorded);
}

/** Restante só após série efetiva, não entre drops/warmups nem entre A e B da mesma round. */
export function restSecondsAfter(
  session: WorkoutSession,
  recordedIncludingJustFinished: RecordedSet[],
): number | null {
  const last = recordedIncludingJustFinished.at(-1);
  if (!last) return null;
  const located = locateSet(session, last.setId);
  if (!located) return null;
  if (located.set.methodKind === "warmup") return null;
  if (isSessionComplete(session, recordedIncludingJustFinished)) return null;
  const next = currentSet(session, recordedIncludingJustFinished);
  const nextLocated = locateSet(session, next.id);
  if (!nextLocated) return null;
  if (next.methodKind === "drop_set" && nextLocated.exercise.id === located.exercise.id)
    return null;
  if (located.set.methodKind === "drop_set" && next.methodKind === "drop_set") return null;
  if (
    located.exercise.groupId &&
    nextLocated.exercise.groupId === located.exercise.groupId &&
    nextLocated.exercise.id !== located.exercise.id
  ) {
    const group = session.exercises.filter((item) => item.groupId === located.exercise.groupId);
    const lastInGroup = group.at(-1);
    if (lastInGroup && located.exercise.id !== lastInGroup.id) return null;
  }
  return located.exercise.restSeconds;
}

export function volumeKg(recorded: RecordedSet[]): number {
  return recorded.reduce((sum, row) => {
    if (row.methodKind === "warmup") return sum;
    if (row.weightKg == null) return sum;
    return sum + row.weightKg * row.reps;
  }, 0);
}

export function completedWorkingSets(session: WorkoutSession, recorded: RecordedSet[]): number {
  const workingIds = new Set(
    session.exercises.flatMap((exercise) => workingSets(exercise).map((set) => set.id)),
  );
  return recorded.filter((row) => workingIds.has(row.setId)).length;
}

export function completedExercises(session: WorkoutSession, recorded: RecordedSet[]): number {
  return session.exercises.filter((exercise) =>
    exercise.sets.every((set) => recorded.some((row) => row.setId === set.id)),
  ).length;
}

export function durationMinutes(startedAt: string, endedAt: string): number {
  const ms = new Date(endedAt).getTime() - new Date(startedAt).getTime();
  return Math.max(0, Math.round(ms / 60_000));
}

export function formatTimer(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export function groupPartners(
  session: WorkoutSession,
  exercise: SessionExercise,
): SessionExercise[] {
  if (!exercise.groupId) return [exercise];
  return session.exercises.filter((item) => item.groupId === exercise.groupId);
}

export function workingSetOrdinal(
  exercise: SessionExercise,
  set: SetPrescription,
): { current: number; total: number } {
  const sets = workingSets(exercise);
  const index = sets.findIndex((item) => item.id === set.id);
  return { current: Math.max(1, index + 1), total: sets.length };
}

export function warmupOrdinal(
  exercise: SessionExercise,
  set: SetPrescription,
): { current: number; total: number } {
  const sets = warmupSets(exercise);
  const index = sets.findIndex((item) => item.id === set.id);
  return { current: Math.max(1, index + 1), total: sets.length };
}

export function dropOrdinal(
  exercise: SessionExercise,
  set: SetPrescription,
): { current: number; total: number } {
  const drops = exercise.sets.filter((item) => item.methodKind === "drop_set");
  const index = drops.findIndex((item) => item.id === set.id);
  return { current: Math.max(1, index + 1), total: drops.length };
}
