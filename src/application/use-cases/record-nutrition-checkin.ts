import { isOpenNutritionDay } from "@/domain/nutrition/macros";
import { err, ok, type Result } from "@/domain/result";
import type { NutritionCheckinRecord, NutritionCheckinRepository } from "../ports";
import { issuesOf, nutritionCheckinInputSchema } from "../validation/schemas";

export type RecordNutritionError =
  | { code: "invalid_input"; issues: string[] }
  | { code: "closed_day" };

export async function recordNutritionCheckin(
  repo: NutritionCheckinRepository,
  input: unknown,
): Promise<Result<NutritionCheckinRecord, RecordNutritionError>> {
  const parsed = nutritionCheckinInputSchema.safeParse(input);
  if (!parsed.success) {
    return err({ code: "invalid_input", issues: issuesOf(parsed.error) });
  }
  const data = parsed.data;
  if (!isOpenNutritionDay(data.checkedInOn, data.todayIso)) {
    return err({ code: "closed_day" });
  }
  const row = await repo.insert({
    userId: data.userId,
    checkedInOn: data.checkedInOn,
    energyKcal: data.energyKcal,
    proteinG: data.proteinG,
    carbohydrateG: data.carbohydrateG,
    fatG: data.fatG,
    fluidMl: data.fluidMl,
    notes: data.notes,
  });
  return ok(row);
}
