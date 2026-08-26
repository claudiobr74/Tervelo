import { err, ok, type Result } from "@/domain/result";
import type { MeasurementRecord, MeasurementRepository } from "../ports";
import { bodyMeasurementInputSchema, issuesOf } from "../validation/schemas";

export type RecordMeasurementError = { code: "invalid_input"; issues: string[] };

export async function recordBodyMeasurement(
  repo: MeasurementRepository,
  input: unknown,
): Promise<Result<MeasurementRecord, RecordMeasurementError>> {
  const parsed = bodyMeasurementInputSchema.safeParse(input);
  if (!parsed.success) {
    return err({ code: "invalid_input", issues: issuesOf(parsed.error) });
  }
  const data = parsed.data;
  const row = await repo.insert({
    userId: data.userId,
    measuredAt: data.measuredAt ?? new Date().toISOString(),
    source: data.source,
    weightKg: data.weightKg,
    bodyFatPercent: data.bodyFatPercent,
    waistCm: data.waistCm,
    rightArmCm: data.rightArmCm,
    rightThighCm: data.rightThighCm,
    notes: data.notes,
    supersedesId: data.supersedesId,
  });
  return ok(row);
}
