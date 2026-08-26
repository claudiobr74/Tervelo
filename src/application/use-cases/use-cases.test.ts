import { describe, expect, it } from "vitest";
import { calculateSessionPlates } from "./calculate-session-plates";
import { searchExercisesUseCase } from "./search-exercises";
import { recordBodyMeasurement } from "./record-measurement";
import { recordSetResult } from "./record-set-result";
import type { MeasurementRecord, MeasurementRepository, SetResultRecord, SetResultRepository } from "../ports";

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

describe("casos de uso", () => {
  it("grava medida via repositório em memória", async () => {
    const result = await recordBodyMeasurement(memoryMeasurements(), { userId, weightKg: 80 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.weightKg).toBe(80);
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
});
