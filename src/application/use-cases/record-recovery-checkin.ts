import { err, ok, type Result } from "@/domain/result";
import type { RecoveryCheckinRecord, RecoveryCheckinRepository } from "../ports";
import { issuesOf, recoveryCheckinInputSchema } from "../validation/schemas";

export type RecordRecoveryError = { code: "invalid_input"; issues: string[] };

export async function recordRecoveryCheckin(
  repo: RecoveryCheckinRepository,
  input: unknown,
): Promise<Result<RecoveryCheckinRecord, RecordRecoveryError>> {
  const parsed = recoveryCheckinInputSchema.safeParse(input);
  if (!parsed.success) {
    return err({ code: "invalid_input", issues: issuesOf(parsed.error) });
  }
  const data = parsed.data;
  const row = await repo.insert({
    userId: data.userId,
    checkedInAt: data.checkedInAt ?? new Date().toISOString(),
    sleepQuality: data.sleepQuality,
    energy: data.energy,
    mood: data.mood,
    muscleSoreness: data.muscleSoreness,
    discomfort: data.discomfort,
    stress: data.stress,
    perceivedRecovery: data.perceivedRecovery,
    notes: data.notes,
  });
  return ok(row);
}
