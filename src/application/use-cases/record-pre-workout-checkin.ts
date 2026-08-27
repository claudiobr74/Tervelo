import { err, ok, type Result } from "@/domain/result";
import type { PreWorkoutCheckinRecord, PreWorkoutCheckinRepository } from "../ports";
import { issuesOf, preWorkoutCheckinInputSchema } from "../validation/schemas";

export type RecordPreWorkoutError = { code: "invalid_input" | "duplicate"; issues?: string[] };

export async function recordPreWorkoutCheckin(
  repo: PreWorkoutCheckinRepository,
  input: unknown,
): Promise<Result<PreWorkoutCheckinRecord, RecordPreWorkoutError>> {
  const parsed = preWorkoutCheckinInputSchema.safeParse(input);
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
    checkedInAt: data.checkedInAt ?? new Date().toISOString(),
    sleepQuality: data.sleepQuality,
    energy: data.energy,
    muscleRecovery: data.muscleRecovery,
    stress: data.stress,
    hasPain: data.hasPain,
    availableMinutes: data.availableMinutes,
  });
  return ok(row);
}
