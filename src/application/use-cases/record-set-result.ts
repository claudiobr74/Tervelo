import { err, ok, type Result } from "@/domain/result";
import type { SetResultRecord, SetResultRepository } from "../ports";
import { issuesOf, setResultInputSchema } from "../validation/schemas";

export type RecordSetResultError = { code: "invalid_input"; issues: string[] };

export async function recordSetResult(
  repo: SetResultRepository,
  input: unknown,
): Promise<Result<SetResultRecord, RecordSetResultError>> {
  const parsed = setResultInputSchema.safeParse(input);
  if (!parsed.success) {
    return err({ code: "invalid_input", issues: issuesOf(parsed.error) });
  }
  const existing = await repo.findByClientMutationId(parsed.data.clientMutationId);
  if (existing) {
    return ok(existing);
  }
  const row = await repo.insert({
    userId: parsed.data.userId,
    setId: parsed.data.setId,
    clientMutationId: parsed.data.clientMutationId,
    weightKg: parsed.data.weightKg,
    reps: parsed.data.reps,
  });
  return ok(row);
}
