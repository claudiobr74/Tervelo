import { z } from "zod";

const kg = z.number().finite().positive();
const cm = z.number().finite().positive().max(300);
const scale = z.int().min(1).max(5);

export const bodyMeasurementInputSchema = z.object({
  userId: z.uuid(),
  measuredAt: z.iso.datetime().optional(),
  source: z.enum(["user", "coach", "device", "import"]).default("user"),
  weightKg: kg.optional(),
  bodyFatPercent: z.number().min(0).max(80).optional(),
  waistCm: cm.optional(),
  rightArmCm: cm.optional(),
  rightThighCm: cm.optional(),
  notes: z.string().max(2000).optional(),
  supersedesId: z.uuid().optional(),
});

export const recoveryCheckinInputSchema = z.object({
  userId: z.uuid(),
  checkedInAt: z.iso.datetime().optional(),
  sleepQuality: scale,
  energy: scale,
  mood: scale,
  muscleSoreness: scale,
  discomfort: scale,
  stress: scale,
  perceivedRecovery: scale,
  notes: z.string().max(2000).optional(),
});

export const setResultInputSchema = z.object({
  userId: z.uuid(),
  setId: z.uuid(),
  performedAt: z.iso.datetime().optional(),
  weightKg: kg.optional(),
  reps: z.int().min(0).max(200).optional(),
  durationSeconds: z.int().min(0).optional(),
  perceivedExertion: z.number().min(0).max(10).optional(),
  repsInReserve: z.number().min(0).max(10).optional(),
  clientMutationId: z.uuid(),
});

export const restTimerInputSchema = z.object({
  userId: z.uuid(),
  durationSeconds: z.int().min(0).max(3600),
  sessionId: z.uuid().optional(),
});

export const plateCalculatorInputSchema = z.object({
  targetKg: kg,
  barKg: z.number().finite().nonnegative(),
  stock: z
    .array(
      z.object({
        weightKg: kg,
        quantity: z.int().min(0),
      }),
    )
    .min(1),
});

export type BodyMeasurementInput = z.infer<typeof bodyMeasurementInputSchema>;
export type RecoveryCheckinInput = z.infer<typeof recoveryCheckinInputSchema>;
export type SetResultInput = z.infer<typeof setResultInputSchema>;
export type PlateCalculatorInput = z.infer<typeof plateCalculatorInputSchema>;

export function issuesOf(error: z.ZodError): string[] {
  return error.issues.map((issue) => issue.message);
}
