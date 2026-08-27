import {
  searchCatalogExercises,
  type CatalogExercise,
  type ExerciseSearchFilter,
} from "@/domain/exercise/search";
import { err, ok, type Result } from "@/domain/result";
import { z } from "zod";
import { issuesOf } from "../validation/schemas";

const searchSchema = z.object({
  query: z.string().max(80).default(""),
  filter: z.enum(["muscle", "equipment", "pattern", "favorites"]).default("muscle"),
});

export function searchExercisesUseCase(
  catalog: readonly CatalogExercise[],
  input: unknown,
): Result<CatalogExercise[], { code: "invalid_input"; issues: string[] }> {
  const parsed = searchSchema.safeParse(input);
  if (!parsed.success) {
    return err({ code: "invalid_input", issues: issuesOf(parsed.error) });
  }
  return ok(
    searchCatalogExercises(catalog, parsed.data.query, parsed.data.filter as ExerciseSearchFilter),
  );
}
