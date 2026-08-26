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

export const nutritionCheckinInputSchema = z.object({
  userId: z.uuid(),
  checkedInOn: z.iso.date(),
  todayIso: z.iso.date(),
  energyKcal: z.number().finite().nonnegative().optional(),
  proteinG: z.number().finite().nonnegative().optional(),
  carbohydrateG: z.number().finite().nonnegative().optional(),
  fatG: z.number().finite().nonnegative().optional(),
  fluidMl: z.number().finite().nonnegative().optional(),
  notes: z.string().max(2000).optional(),
});

export const restTimerInputSchema = z.object({
  userId: z.uuid(),
  durationSeconds: z.int().min(0).max(3600),
  sessionId: z.uuid().optional(),
});

export const preWorkoutCheckinInputSchema = z.object({
  userId: z.uuid(),
  clientMutationId: z.uuid(),
  status: z.enum(["completed", "skipped"]),
  checkedInAt: z.iso.datetime().optional(),
  sleepQuality: z.int().min(1).max(5).optional(),
  energy: z.int().min(1).max(5).optional(),
  muscleRecovery: z.int().min(1).max(4).optional(),
  stress: z.int().min(1).max(4).optional(),
  hasPain: z.boolean().optional(),
  availableMinutes: z.int().positive().max(240).optional(),
});

export const postWorkoutCheckoutInputSchema = z.object({
  userId: z.uuid(),
  clientMutationId: z.uuid(),
  status: z.enum(["completed", "skipped"]),
  checkedOutAt: z.iso.datetime().optional(),
  expectation: z.enum(["muito_abaixo", "abaixo", "como_esperado", "acima", "muito_acima"]).optional(),
  difficulty: z.enum(["muito_facil", "facil", "adequada", "dificil", "muito_dificil"]).optional(),
  planCompletion: z.enum(["sim", "parcialmente", "nao"]).optional(),
  partialReasons: z.array(z.string()).optional(),
  hadPain: z.boolean().optional(),
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
export type NutritionCheckinInput = z.infer<typeof nutritionCheckinInputSchema>;
export type PlateCalculatorInput = z.infer<typeof plateCalculatorInputSchema>;

export function issuesOf(error: z.ZodError): string[] {
  return error.issues.map((issue) => issue.message);
}
