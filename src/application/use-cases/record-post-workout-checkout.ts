import { err, ok, type Result } from "@/domain/result";
import type { PostWorkoutCheckoutRecord, PostWorkoutCheckoutRepository } from "../ports";
import { issuesOf, postWorkoutCheckoutInputSchema } from "../validation/schemas";

export type RecordPostWorkoutError = { code: "invalid_input" | "duplicate"; issues?: string[] };

export async function recordPostWorkoutCheckout(
  repo: PostWorkoutCheckoutRepository,
  input: unknown,
): Promise<Result<PostWorkoutCheckoutRecord, RecordPostWorkoutError>> {
  const parsed = postWorkoutCheckoutInputSchema.safeParse(input);
  if (!parsed.success) {
    return err({ code: "invalid_input", issues: issuesOf(parsed.error) });
  }
  const existing = await repo.findByClientMutationId(parsed.data.clientMutationId);
  if (existing) return ok(existing);
  const data = parsed.data;
  const row = await repo.insert({
    userId: data.userId,
    clientMutationId: data.clientMutationId,
    status: data.status,
    checkedOutAt: data.checkedOutAt ?? new Date().toISOString(),
    expectation: data.expectation,
    difficulty: data.difficulty,
    planCompletion: data.planCompletion,
    partialReasons: data.partialReasons,
    hadPain: data.hadPain,
  });
  return ok(row);
}
