import { describe, expect, it } from "vitest";
import { METRIC_LABELS } from "@/domain/labels";
import {
  bodyMeasurementInputSchema,
  plateCalculatorInputSchema,
  recoveryCheckinInputSchema,
  restTimerInputSchema,
  setResultInputSchema,
} from "./schemas";

const userId = "11111111-1111-4111-8111-111111111111";

describe("validações Zod", () => {
  it("aceita medida corporal mínima", () => {
    const parsed = bodyMeasurementInputSchema.safeParse({
      userId,
      weightKg: 82.4,
    });
    expect(parsed.success).toBe(true);
  });

  it("rejeita percentual de gordura impossível", () => {
    const parsed = bodyMeasurementInputSchema.safeParse({
      userId,
      bodyFatPercent: 140,
    });
    expect(parsed.success).toBe(false);
  });

  it("check-in de recuperação é escala 1–5", () => {
    const ok = recoveryCheckinInputSchema.safeParse({
      userId,
      sleepQuality: 5,
      energy: 4,
      mood: 3,
      muscleSoreness: 2,
      discomfort: 1,
      stress: 2,
      perceivedRecovery: 4,
    });
    expect(ok.success).toBe(true);
    const bad = recoveryCheckinInputSchema.safeParse({
      userId,
      sleepQuality: 6,
      energy: 4,
      mood: 3,
      muscleSoreness: 2,
      discomfort: 1,
      stress: 2,
      perceivedRecovery: 4,
    });
    expect(bad.success).toBe(false);
  });

  it("resultado de série exige idempotência (clientMutationId)", () => {
    const parsed = setResultInputSchema.safeParse({
      userId,
      setId: "22222222-2222-4222-8222-222222222222",
      reps: 8,
      weightKg: 80,
    });
    expect(parsed.success).toBe(false);
  });

  it("timer e anilhas validam números", () => {
    expect(restTimerInputSchema.safeParse({ userId, durationSeconds: 90 }).success).toBe(true);
    expect(restTimerInputSchema.safeParse({ userId, durationSeconds: -1 }).success).toBe(false);
    expect(
      plateCalculatorInputSchema.safeParse({
        targetKg: 100,
        barKg: 20,
        stock: [{ weightKg: 20, quantity: 4 }],
      }).success,
    ).toBe(true);
  });

  it("labels de produto não usam sigla", () => {
    expect(METRIC_LABELS.repsInReserve).toBe("Repetições em reserva");
    expect(METRIC_LABELS.perceivedExertion).toBe("Esforço percebido");
  });
});
