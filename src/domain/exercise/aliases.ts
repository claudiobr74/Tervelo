export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("pt-BR")
    .trim()
    .replace(/\s+/g, " ");
}

export type ExerciseAlias = {
  canonicalExerciseId: string;
  alias: string;
};

export function matchExerciseAliases(
  query: string,
  aliases: readonly ExerciseAlias[],
): string[] {
  const needle = normalizeSearchText(query);
  if (!needle) return [];
  const ids = new Set<string>();
  for (const entry of aliases) {
    if (normalizeSearchText(entry.alias).includes(needle)) {
      ids.add(entry.canonicalExerciseId);
    }
  }
  return [...ids];
}
