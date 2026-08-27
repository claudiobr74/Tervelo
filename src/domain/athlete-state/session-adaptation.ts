import type { SessionExercise } from "../training/session";
import type { ChangeScope } from "./types";

export type PlannedExercisePriority = "primary" | "accessory" | "finisher";

export type AdaptableExercise = {
  id: string;
  name: string;
  priority: PlannedExercisePriority;
  sets: number;
};

export type SessionTimeAdaptation = {
  scope: ChangeScope;
  kept: AdaptableExercise[];
  dropped: AdaptableExercise[];
  reducedSets: { id: string; from: number; to: number }[];
  temporary: true;
  affectsFutureProgram: false;
};

function priorityOf(exercise: SessionExercise, index: number, total: number): PlannedExercisePriority {
  if (index === 0 || index === 1) return "primary";
  if (index >= total - 1) return "finisher";
  return "accessory";
}

export function exercisesFromSession(session: {
  exercises: SessionExercise[];
}): AdaptableExercise[] {
  return session.exercises.map((exercise, index) => ({
    id: exercise.id,
    name: exercise.namePt,
    priority: priorityOf(exercise, index, session.exercises.length),
    sets: exercise.sets.filter((set) => set.methodKind !== "warmup").length,
  }));
}

/**
 * Adapta só a sessão atual. Não reduz todas as séries proporcionalmente.
 * Preserva objetivo → exercícios prioritários → qualidade → retira o de menor prioridade.
 */
export function adaptSessionForAvailableTime(input: {
  plannedMinutes: number;
  availableMinutes: number;
  exercises: AdaptableExercise[];
}): SessionTimeAdaptation {
  if (input.availableMinutes >= input.plannedMinutes) {
    return {
      scope: "SEM_MUDANCA",
      kept: input.exercises,
      dropped: [],
      reducedSets: [],
      temporary: true,
      affectsFutureProgram: false,
    };
  }

  const ratio = input.availableMinutes / input.plannedMinutes;
  const kept: AdaptableExercise[] = [];
  const dropped: AdaptableExercise[] = [];
  const reducedSets: SessionTimeAdaptation["reducedSets"] = [];

  const finishers = input.exercises.filter((item) => item.priority === "finisher");
  const accessories = input.exercises.filter((item) => item.priority === "accessory");
  const primaries = input.exercises.filter((item) => item.priority === "primary");

  if (ratio <= 0.7) {
    dropped.push(...finishers);
    if (ratio <= 0.55) dropped.push(...accessories);
    else kept.push(...accessories);
    kept.push(...primaries);
  } else {
    kept.push(...primaries, ...accessories);
    dropped.push(...finishers);
  }

  if (kept.length === 0 && primaries.length > 0) {
    kept.push(primaries[0]);
    dropped.splice(
      dropped.findIndex((item) => item.id === primaries[0].id),
      1,
    );
  }

  const remainingRatio = input.availableMinutes / Math.max(1, input.plannedMinutes * (kept.length / input.exercises.length));
  if (remainingRatio < 0.85 && kept.length > 1) {
    const last = kept[kept.length - 1];
    if (last.priority !== "primary" && last.sets > 2) {
      reducedSets.push({ id: last.id, from: last.sets, to: Math.max(2, last.sets - 1) });
    }
  }

  return {
    scope: "AJUSTE_DA_SESSAO",
    kept,
    dropped,
    reducedSets,
    temporary: true,
    affectsFutureProgram: false,
  };
}
