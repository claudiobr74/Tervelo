import { describe, expect, it } from "vitest";
import { applySessionSubstitution } from "./hierarchy";
import {
  applySessionExerciseSubstitution,
  completedWorkingSets,
  currentExercise,
  currentSet,
  flattenSession,
  formatTimer,
  restSecondsAfter,
  volumeKg,
  type RecordedSet,
  type SessionExercise,
  type WorkoutSession,
} from "./session";
import { enqueueSetResult, flushSetResultQueue } from "./offline-queue";

function exercise(
  partial: Partial<SessionExercise> & Pick<SessionExercise, "id" | "namePt" | "sets">,
): SessionExercise {
  return {
    position: 1,
    muscleGroup: "Peitoral",
    restSeconds: 120,
    methodKind: "working",
    methodParams: {},
    groupId: null,
    plannedVariantId: "v1",
    loadStepKg: 2.5,
    ...partial,
  };
}

const session: WorkoutSession = {
  id: "s1",
  userId: "11111111-1111-4111-8111-111111111111",
  title: "Peitoral e Tríceps",
  focus: "Foco em hipertrofia",
  programLabel: "Treino A",
  estimatedMinutes: 52,
  status: "planned",
  exercises: [
    exercise({
      id: "e1",
      namePt: "Supino Reto",
      sets: [
        {
          id: "w1",
          setIndex: 0,
          methodKind: "warmup",
          targetRepsMin: 15,
          targetRepsMax: 15,
          targetWeightKg: 20,
          previousWeightKg: 20,
          suggestedWeightKg: 20,
          targetRepsInReserve: 4,
        },
        {
          id: "set1",
          setIndex: 1,
          methodKind: "working",
          targetRepsMin: 8,
          targetRepsMax: 10,
          targetWeightKg: 80,
          previousWeightKg: 80,
          suggestedWeightKg: 82,
          targetRepsInReserve: 2,
        },
        {
          id: "set2",
          setIndex: 2,
          methodKind: "working",
          targetRepsMin: 8,
          targetRepsMax: 10,
          targetWeightKg: 80,
          previousWeightKg: 80,
          suggestedWeightKg: 82,
          targetRepsInReserve: 2,
        },
      ],
    }),
  ],
};

function row(partial: Partial<RecordedSet> & Pick<RecordedSet, "setId">): RecordedSet {
  return {
    sessionExerciseId: "e1",
    clientMutationId: `c-${partial.setId}`,
    weightKg: 80,
    reps: 8,
    repsInReserve: 2,
    methodKind: "working",
    performedAt: "2026-08-26T12:00:00.000Z",
    ...partial,
  };
}

const superSession: WorkoutSession = {
  ...session,
  id: "super",
  exercises: [
    exercise({
      id: "a",
      namePt: "Rosca Direta com Barra",
      methodKind: "superset",
      groupId: "g1",
      restSeconds: 90,
      sets: [
        {
          id: "a1",
          setIndex: 0,
          methodKind: "working",
          targetRepsMin: 10,
          targetRepsMax: 10,
          targetWeightKg: 30,
          previousWeightKg: 30,
          suggestedWeightKg: 30,
          targetRepsInReserve: 2,
        },
        {
          id: "a2",
          setIndex: 1,
          methodKind: "working",
          targetRepsMin: 10,
          targetRepsMax: 10,
          targetWeightKg: 30,
          previousWeightKg: 30,
          suggestedWeightKg: 30,
          targetRepsInReserve: 2,
        },
      ],
    }),
    exercise({
      id: "b",
      namePt: "Tríceps Pulley",
      muscleGroup: "Tríceps",
      methodKind: "superset",
      groupId: "g1",
      restSeconds: 90,
      position: 2,
      sets: [
        {
          id: "b1",
          setIndex: 0,
          methodKind: "working",
          targetRepsMin: 10,
          targetRepsMax: 10,
          targetWeightKg: 25,
          previousWeightKg: 25,
          suggestedWeightKg: 25,
          targetRepsInReserve: 2,
        },
        {
          id: "b2",
          setIndex: 1,
          methodKind: "working",
          targetRepsMin: 10,
          targetRepsMax: 10,
          targetWeightKg: 25,
          previousWeightKg: 25,
          suggestedWeightKg: 25,
          targetRepsInReserve: 2,
        },
      ],
    }),
  ],
};

const dropSession: WorkoutSession = {
  ...session,
  id: "drop",
  exercises: [
    exercise({
      id: "d1",
      namePt: "Rosca Direta",
      methodKind: "drop_set",
      restSeconds: 120,
      sets: [
        {
          id: "ds1",
          setIndex: 0,
          methodKind: "working",
          targetRepsMin: 10,
          targetRepsMax: 10,
          targetWeightKg: 20,
          previousWeightKg: 20,
          suggestedWeightKg: 20,
          targetRepsInReserve: 1,
        },
        {
          id: "dd1",
          setIndex: 1,
          methodKind: "drop_set",
          targetRepsMin: 8,
          targetRepsMax: 8,
          targetWeightKg: 14,
          previousWeightKg: 14,
          suggestedWeightKg: 14,
          targetRepsInReserve: 1,
        },
        {
          id: "dd2",
          setIndex: 2,
          methodKind: "drop_set",
          targetRepsMin: 6,
          targetRepsMax: 6,
          targetWeightKg: 10,
          previousWeightKg: 10,
          suggestedWeightKg: 10,
          targetRepsInReserve: 0,
        },
      ],
    }),
    exercise({
      id: "d2",
      namePt: "Tríceps Pulley",
      position: 2,
      restSeconds: 90,
      sets: [
        {
          id: "n1",
          setIndex: 0,
          methodKind: "working",
          targetRepsMin: 10,
          targetRepsMax: 10,
          targetWeightKg: 25,
          previousWeightKg: 25,
          suggestedWeightKg: 25,
          targetRepsInReserve: 2,
        },
      ],
    }),
  ],
};

describe("sessão de treino", () => {
  it("substituição pontual não muta a sessão", () => {
    const next = applySessionExerciseSubstitution(session, {
      sessionExerciseId: "e1",
      fromVariantId: "v1",
      toVariantId: "v2",
      reason: "aparelho ocupado",
    });
    expect(next).toEqual(session);
    expect(
      applySessionSubstitution(
        { id: "p1", title: "A", blocks: [] },
        {
          sessionExerciseId: "e1",
          fromVariantId: "v1",
          toVariantId: "v2",
          reason: "aparelho ocupado",
        },
      ).title,
    ).toBe("A");
  });

  it("aquecimento não entra no volume e não abre descanso", () => {
    const warmup = row({ setId: "w1", methodKind: "warmup", weightKg: 20, reps: 15 });
    expect(volumeKg([warmup])).toBe(0);
    expect(restSecondsAfter(session, [warmup])).toBeNull();
    expect(currentSet(session, [warmup]).id).toBe("set1");
  });

  it("série de trabalho conta volume e pede intervalo", () => {
    const warmup = row({ setId: "w1", methodKind: "warmup", weightKg: 20, reps: 15 });
    const work = row({ setId: "set1", weightKg: 80, reps: 8 });
    expect(volumeKg([warmup, work])).toBe(640);
    expect(restSecondsAfter(session, [warmup, work])).toBe(120);
    expect(completedWorkingSets(session, [warmup, work])).toBe(1);
  });

  it("formata o cronômetro a partir do relógio", () => {
    expect(formatTimer(102)).toBe("01:42");
    expect(formatTimer(0)).toBe("00:00");
  });

  it("intercala supersérie e só descansa depois de A e B", () => {
    expect(flattenSession(superSession).map((item) => item.set.id)).toEqual([
      "a1",
      "b1",
      "a2",
      "b2",
    ]);
    const a1 = row({ setId: "a1", sessionExerciseId: "a", weightKg: 30, reps: 10 });
    const b1 = row({ setId: "b1", sessionExerciseId: "b", weightKg: 25, reps: 10 });
    const a2 = row({ setId: "a2", sessionExerciseId: "a", weightKg: 30, reps: 10 });
    expect(restSecondsAfter(superSession, [a1])).toBeNull();
    expect(currentExercise(superSession, [a1]).id).toBe("b");
    expect(restSecondsAfter(superSession, [a1, b1])).toBe(90);
    expect(restSecondsAfter(superSession, [a1, b1, a2])).toBeNull();
  });

  it("não descansa entre drops da mesma série", () => {
    const set1 = row({ setId: "ds1", sessionExerciseId: "d1", weightKg: 20, reps: 10 });
    const drop1 = row({
      setId: "dd1",
      sessionExerciseId: "d1",
      methodKind: "drop_set",
      weightKg: 14,
      reps: 8,
    });
    const drop2 = row({
      setId: "dd2",
      sessionExerciseId: "d1",
      methodKind: "drop_set",
      weightKg: 10,
      reps: 6,
    });
    expect(restSecondsAfter(dropSession, [set1])).toBeNull();
    expect(restSecondsAfter(dropSession, [set1, drop1])).toBeNull();
    expect(restSecondsAfter(dropSession, [set1, drop1, drop2])).toBe(120);
  });
});

describe("fila offline de resultados", () => {
  it("é idempotente no clientMutationId", () => {
    const item = {
      clientMutationId: "33333333-3333-4333-8333-333333333333",
      userId: "11111111-1111-4111-8111-111111111111",
      setId: "set1",
      reps: 8,
      methodKind: "working",
      performedAt: "2026-08-26T12:00:00.000Z",
    };
    const once = enqueueSetResult([], item);
    const twice = enqueueSetResult(once, { ...item, reps: 99 });
    expect(twice).toHaveLength(1);
    expect(twice[0].reps).toBe(8);
  });

  it("marca pendente como sincronizado após envio", async () => {
    const queued = enqueueSetResult([], {
      clientMutationId: "33333333-3333-4333-8333-333333333333",
      userId: "11111111-1111-4111-8111-111111111111",
      setId: "set1",
      reps: 8,
      methodKind: "working",
      performedAt: "2026-08-26T12:00:00.000Z",
    });
    const flushed = await flushSetResultQueue(queued, async () => undefined);
    expect(flushed[0].status).toBe("synced");
  });
});
