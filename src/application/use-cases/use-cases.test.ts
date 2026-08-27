import { describe, expect, it } from "vitest";
import { calculateSessionPlates } from "./calculate-session-plates";
import { searchExercisesUseCase } from "./search-exercises";
import { recordBodyMeasurement } from "./record-measurement";
import { recordNutritionCheckin } from "./record-nutrition-checkin";
import { recordRecoveryCheckin } from "./record-recovery-checkin";
import { recordPostWorkoutCheckout } from "./record-post-workout-checkout";
import { recordPreWorkoutCheckin } from "./record-pre-workout-checkin";
import { recordSetResult } from "./record-set-result";
import type {
  MeasurementRecord,
  MeasurementRepository,
  NutritionCheckinRecord,
  NutritionCheckinRepository,
  PostWorkoutCheckoutRecord,
  PostWorkoutCheckoutRepository,
  PreWorkoutCheckinRecord,
  PreWorkoutCheckinRepository,
  RecoveryCheckinRecord,
  RecoveryCheckinRepository,
  SetResultRecord,
  SetResultRepository,
} from "../ports";

const userId = "11111111-1111-4111-8111-111111111111";

function memoryMeasurements(): MeasurementRepository {
  const rows: MeasurementRecord[] = [];
  return {
    async insert(row) {
      const created = { ...row, id: `m${rows.length + 1}` };
      rows.push(created);
      return created;
    },
  };
}

function memoryRecovery(): RecoveryCheckinRepository {
  const rows: RecoveryCheckinRecord[] = [];
  return {
    async insert(row) {
      const created = { ...row, id: `r${rows.length + 1}` };
      rows.push(created);
      return created;
    },
  };
}

function memoryNutrition(): NutritionCheckinRepository {
  const rows: NutritionCheckinRecord[] = [];
  return {
    async insert(row) {
      const created = { ...row, id: `n${rows.length + 1}` };
      rows.push(created);
      return created;
    },
  };
}

function memorySetResults(): SetResultRepository {
  const rows: SetResultRecord[] = [];
  return {
    async findByClientMutationId(id) {
      return rows.find((row) => row.clientMutationId === id) ?? null;
    },
    async insert(row) {
      const created = { ...row, id: `s${rows.length + 1}` };
      rows.push(created);
      return created;
    },
  };
}

function memoryPreWorkout(): PreWorkoutCheckinRepository {
  const rows: PreWorkoutCheckinRecord[] = [];
  return {
    async findByClientMutationId(id) {
      return rows.find((row) => row.clientMutationId === id) ?? null;
    },
    async insert(row) {
      const created = { ...row, id: `p${rows.length + 1}` };
      rows.push(created);
      return created;
    },
  };
}

function memoryPostWorkout(): PostWorkoutCheckoutRepository {
  const rows: PostWorkoutCheckoutRecord[] = [];
  return {
    async findByClientMutationId(id) {
      return rows.find((row) => row.clientMutationId === id) ?? null;
    },
    async insert(row) {
      const created = { ...row, id: `c${rows.length + 1}` };
      rows.push(created);
      return created;
    },
  };
}

describe("casos de uso", () => {
  it("grava medida via repositório em memória", async () => {
    const result = await recordBodyMeasurement(memoryMeasurements(), {
      userId,
      weightKg: 80,
      waistCm: 84,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.weightKg).toBe(80);
      expect(result.value.waistCm).toBe(84);
    }
  });

  it("grava check-in de recuperação append-only", async () => {
    const result = await recordRecoveryCheckin(memoryRecovery(), {
      userId,
      sleepQuality: 4,
      energy: 4,
      mood: 4,
      muscleSoreness: 2,
      discomfort: 2,
      stress: 2,
      perceivedRecovery: 4,
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.perceivedRecovery).toBe(4);
  });

  it("resultado de série é idempotente no clientMutationId", async () => {
    const repo = memorySetResults();
    const payload = {
      userId,
      setId: "22222222-2222-4222-8222-222222222222",
      clientMutationId: "33333333-3333-4333-8333-333333333333",
      reps: 8,
      weightKg: 100,
    };
    const first = await recordSetResult(repo, payload);
    const second = await recordSetResult(repo, { ...payload, reps: 99 });
    expect(first.ok && second.ok).toBe(true);
    if (first.ok && second.ok) {
      expect(second.value.id).toBe(first.value.id);
      expect(second.value.reps).toBe(8);
    }
  });

  it("grava check-in de nutrição só no dia aberto", async () => {
    const repo = memoryNutrition();
    const open = await recordNutritionCheckin(repo, {
      userId,
      checkedInOn: "2026-08-26",
      todayIso: "2026-08-26",
      energyKcal: 2450,
      proteinG: 142,
    });
    expect(open.ok).toBe(true);
    const closed = await recordNutritionCheckin(repo, {
      userId,
      checkedInOn: "2026-08-25",
      todayIso: "2026-08-26",
      energyKcal: 1800,
    });
    expect(closed.ok).toBe(false);
    if (!closed.ok) expect(closed.error.code).toBe("closed_day");
  });

  it("calculadora de anilhas passa pela validação Zod", async () => {
    const result = await calculateSessionPlates({
      targetKg: 60,
      barKg: 20,
      stock: [{ weightKg: 20, quantity: 4 }],
    });
    expect(result.ok).toBe(true);
  });

  it("busca de exercícios valida filtro", () => {
    const result = searchExercisesUseCase(
      [{ id: "1", namePt: "Puxada", primaryMuscle: "Costas", secondaryMuscles: [], equipmentName: "Polia", movementPattern: "Puxar vertical", aliases: ["pux"] }],
      { query: "pux", filter: "muscle" },
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toHaveLength(1);
  });

  it("check-in pré-treino é idempotente e aceita pulado", async () => {
    const repo = memoryPreWorkout();
    const payload = {
      userId,
      clientMutationId: "44444444-4444-4444-8444-444444444444",
      status: "skipped" as const,
    };
    const first = await recordPreWorkoutCheckin(repo, payload);
    const second = await recordPreWorkoutCheckin(repo, { ...payload, status: "completed" });
    expect(first.ok && second.ok).toBe(true);
    if (first.ok && second.ok) {
      expect(second.value.id).toBe(first.value.id);
      expect(second.value.status).toBe("skipped");
    }
  });

  it("check-out pós-treino é idempotente", async () => {
    const repo = memoryPostWorkout();
    const payload = {
      userId,
      clientMutationId: "55555555-5555-4555-8555-555555555555",
      status: "completed" as const,
      expectation: "como_esperado" as const,
      planCompletion: "sim" as const,
    };
    const first = await recordPostWorkoutCheckout(repo, payload);
    // Reenviar a mesma operação (retry da fila offline) não pode criar um segundo check-out.
    const second = await recordPostWorkoutCheckout(repo, { ...payload, expectation: "abaixo" as const });
    expect(first.ok && second.ok).toBe(true);
    if (first.ok && second.ok) {
      expect(second.value.id).toBe(first.value.id);
      expect(second.value.expectation).toBe("como_esperado");
    }
  });
});
