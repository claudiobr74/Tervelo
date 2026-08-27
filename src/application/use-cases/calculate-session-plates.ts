import { calculatePlates, type PlateError, type PlateSolution } from "@/domain/plates/calculate";
import { err, type Result } from "@/domain/result";
import { issuesOf, plateCalculatorInputSchema } from "../validation/schemas";

export async function calculateSessionPlates(
  input: unknown,
): Promise<Result<PlateSolution, PlateError | { code: "invalid_input"; issues: string[] }>> {
  const parsed = plateCalculatorInputSchema.safeParse(input);
  if (!parsed.success) {
    return err({ code: "invalid_input", issues: issuesOf(parsed.error) });
  }
  return calculatePlates(parsed.data);
}
