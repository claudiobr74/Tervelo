import type { CatalogExercise } from "@/domain/exercise/search";
import type { CatalogEquipment } from "@/lib/catalog/preview-catalog";

export type CatalogGraphql = {
  canonical_exercises: {
    id: string;
    name_pt: string;
    description: string | null;
    movement_pattern_id: string | null;
  }[];
  exercise_aliases: { alias: string; locale: string; canonical_exercise_id: string }[];
  movement_patterns: { id: string; slug: string; name_pt: string }[];
  exercise_muscles: { exercise_id: string; muscle_id: string; role: string }[];
  muscles: { id: string; name_pt: string }[];
  exercise_variants: { id: string; canonical_exercise_id: string; name_pt: string }[];
  exercise_equipment: { exercise_variant_id: string; equipment_id: string }[];
  equipment: {
    id: string;
    name_pt: string;
    resistance_system: string | null;
    starting_load_kg: number | string | null;
    increment_kg: number | string | null;
    category_id: string | null;
    independent_arms: boolean | null;
  }[];
  equipment_categories: { id: string; slug: string; name_pt: string }[];
};

function num(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  return String(value);
}

export function mapCatalogExercises(data: CatalogGraphql): CatalogExercise[] {
  const aliases = new Map<string, string[]>();
  for (const row of data.exercise_aliases) {
    const list = aliases.get(row.canonical_exercise_id) ?? [];
    list.push(row.alias);
    aliases.set(row.canonical_exercise_id, list);
  }
  const patterns = new Map(data.movement_patterns.map((item) => [item.id, item.name_pt]));
  const muscleNames = new Map(data.muscles.map((item) => [item.id, item.name_pt]));
  const primary = new Map<string, string>();
  const secondary = new Map<string, string[]>();
  for (const row of data.exercise_muscles) {
    const name = muscleNames.get(row.muscle_id) ?? "";
    if (!name) continue;
    if (row.role === "secondary") {
      const list = secondary.get(row.exercise_id) ?? [];
      list.push(name);
      secondary.set(row.exercise_id, list);
    } else if (!primary.has(row.exercise_id)) {
      primary.set(row.exercise_id, name);
    }
  }
  const variantByCanonical = new Map<string, string[]>();
  for (const variant of data.exercise_variants) {
    const list = variantByCanonical.get(variant.canonical_exercise_id) ?? [];
    list.push(variant.id);
    variantByCanonical.set(variant.canonical_exercise_id, list);
  }
  const equipmentByVariant = new Map<string, string>();
  const equipmentNames = new Map(data.equipment.map((item) => [item.id, item.name_pt]));
  for (const row of data.exercise_equipment) {
    if (!equipmentByVariant.has(row.exercise_variant_id)) {
      equipmentByVariant.set(row.exercise_variant_id, equipmentNames.get(row.equipment_id) ?? "");
    }
  }

  return data.canonical_exercises.map((exercise) => {
    const variantIds = variantByCanonical.get(exercise.id) ?? [];
    const equipmentName =
      variantIds.map((id) => equipmentByVariant.get(id)).find((name) => name) ?? "";
    return {
      id: exercise.id,
      namePt: exercise.name_pt,
      primaryMuscle: primary.get(exercise.id) ?? "",
      secondaryMuscles: secondary.get(exercise.id) ?? [],
      equipmentName,
      movementPattern: exercise.movement_pattern_id
        ? (patterns.get(exercise.movement_pattern_id) ?? "")
        : "",
      aliases: aliases.get(exercise.id) ?? [],
    };
  });
}

export function mapCatalogEquipment(data: CatalogGraphql): CatalogEquipment[] {
  const categories = new Map(data.equipment_categories.map((item) => [item.id, item.name_pt]));
  return data.equipment.map((item) => ({
    id: item.id,
    namePt: item.name_pt,
    category: item.category_id ? (categories.get(item.category_id) ?? "") : "",
    muscles: "",
    resistance: item.resistance_system ?? "",
    adjustments: item.independent_arms ? "Braços independentes" : "",
    range: item.starting_load_kg != null ? `A partir de ${num(item.starting_load_kg)} kg` : "",
    increment: item.increment_kg != null ? `${num(item.increment_kg)} kg` : "",
    loadingSystem: item.resistance_system ?? "",
    manufacturers: [],
  }));
}
