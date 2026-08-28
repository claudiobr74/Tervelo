import { matchExerciseAliases, normalizeSearchText } from "./aliases";

export type ExerciseSearchFilter = "muscle" | "equipment" | "pattern" | "favorites";

export type CatalogExercise = {
  id: string;
  namePt: string;
  description?: string;
  primaryMuscle: string;
  secondaryMuscles: string[];
  equipmentName: string;
  movementPattern: string;
  aliases: string[];
  favorite?: boolean;
  imageSrc?: string;
};

export function searchCatalogExercises(
  exercises: readonly CatalogExercise[],
  query: string,
  filter: ExerciseSearchFilter = "muscle",
): CatalogExercise[] {
  const needle = normalizeSearchText(query);
  const aliasHits = new Set(
    matchExerciseAliases(
      query,
      exercises.flatMap((exercise) =>
        [exercise.namePt, ...exercise.aliases].map((alias) => ({
          canonicalExerciseId: exercise.id,
          alias,
        })),
      ),
    ),
  );

  return exercises.filter((exercise) => {
    if (filter === "favorites" && !exercise.favorite) return false;
    if (!needle) return true;
    if (aliasHits.has(exercise.id)) return true;
    const haystack = [
      exercise.namePt,
      exercise.description ?? "",
      exercise.primaryMuscle,
      ...exercise.secondaryMuscles,
      exercise.equipmentName,
      exercise.movementPattern,
    ]
      .map(normalizeSearchText)
      .join(" ");
    if (filter === "equipment") return normalizeSearchText(exercise.equipmentName).includes(needle);
    if (filter === "pattern") return normalizeSearchText(exercise.movementPattern).includes(needle);
    if (filter === "muscle") {
      const muscles = [exercise.primaryMuscle, ...exercise.secondaryMuscles]
        .map(normalizeSearchText)
        .join(" ");
      return muscles.includes(needle) || haystack.includes(needle);
    }
    return haystack.includes(needle);
  });
}
