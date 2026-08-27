export const TRAINING_HIERARCHY = [
  "goal",
  "program",
  "block",
  "week",
  "session",
  "exercise",
  "set",
  "result",
] as const;

export type TrainingHierarchyLevel = (typeof TRAINING_HIERARCHY)[number];

export const METHOD_KINDS = [
  "warmup",
  "working",
  "backoff",
  "superset",
  "triset",
  "giant_set",
  "circuit",
  "drop_set",
  "rest_pause",
  "cluster",
  "myo_reps",
  "pause",
  "tempo",
  "isometric",
] as const;

export type MethodKind = (typeof METHOD_KINDS)[number];

export type TrainingProgramSnapshot = {
  id: string;
  title: string;
  blocks: { id: string; position: number }[];
};

export type ExerciseSubstitution = {
  sessionExerciseId: string;
  fromVariantId: string;
  toVariantId: string;
  reason: string;
};

/** Substituição pontual não reescreve o programa. */
export function applySessionSubstitution(
  program: TrainingProgramSnapshot,
  substitution: ExerciseSubstitution,
): TrainingProgramSnapshot {
  void substitution;
  return program;
}

export function isMethodKind(value: string): value is MethodKind {
  return (METHOD_KINDS as readonly string[]).includes(value);
}
