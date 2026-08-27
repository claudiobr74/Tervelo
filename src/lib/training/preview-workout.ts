import type { MethodKind } from "@/domain/training/hierarchy";
import type { SessionExercise, SetPrescription, WorkoutSession } from "@/domain/training/session";

export const PREVIEW_TRAINING_USER_ID = "11111111-1111-4111-8111-111111111111";

function setRow(
  id: string,
  setIndex: number,
  methodKind: MethodKind,
  repsMin: number,
  repsMax: number,
  previous: number | null,
  suggested: number | null,
  rir: number,
  extra?: Partial<SetPrescription>,
): SetPrescription {
  return {
    id,
    setIndex,
    methodKind,
    targetRepsMin: repsMin,
    targetRepsMax: repsMax,
    targetWeightKg: suggested,
    previousWeightKg: previous,
    suggestedWeightKg: suggested,
    targetRepsInReserve: rir,
    ...extra,
  };
}

function workingBlock(
  prefix: string,
  count: number,
  repsMin: number,
  repsMax: number,
  previous: number | null,
  suggested: number | null,
  startIndex = 0,
): SetPrescription[] {
  return Array.from({ length: count }, (_, index) =>
    setRow(
      `${prefix}-w${index + 1}`,
      startIndex + index,
      "working",
      repsMin,
      repsMax,
      previous,
      suggested,
      2,
    ),
  );
}

const benchWarmups: SetPrescription[] = [
  setRow("ex1-wu1", 0, "warmup", 15, 15, 20, 20, 4),
  setRow("ex1-wu2", 1, "warmup", 10, 10, 40, 40, 4),
  setRow("ex1-wu3", 2, "warmup", 5, 5, 60, 60, 3),
];

function exercise(
  partial: Omit<SessionExercise, "methodParams" | "plannedVariantId"> & {
    methodParams?: Record<string, unknown>;
    plannedVariantId?: string;
  },
): SessionExercise {
  return {
    methodParams: {},
    plannedVariantId: partial.id,
    ...partial,
  };
}

export const PREVIEW_WORKOUT: WorkoutSession = {
  id: "preview-session-chest-triceps",
  userId: PREVIEW_TRAINING_USER_ID,
  title: "Peitoral e Tríceps",
  focus: "Foco em hipertrofia de empurrar e porção clavicular",
  programLabel: "Treino A • Bloco 2 Hipertrofia",
  estimatedMinutes: 52,
  status: "planned",
  exercises: [
    exercise({
      id: "ex-supino-reto",
      position: 1,
      namePt: "Supino Reto",
      muscleGroup: "Peitoral",
      imageSrc: "/catalog/thumb-supino.webp",
      restSeconds: 120,
      methodKind: "working",
      groupId: null,
      loadStepKg: 2.5,
      sets: [...benchWarmups, ...workingBlock("ex1", 4, 8, 10, 80, 82, 3)],
    }),
    exercise({
      id: "ex-supino-inclinado",
      position: 2,
      namePt: "Supino Inclinado com Halteres",
      muscleGroup: "Peitoral",
      imageSrc: "/catalog/thumb-supino.webp",
      restSeconds: 120,
      methodKind: "working",
      groupId: null,
      loadStepKg: 1,
      sets: workingBlock("ex2", 3, 10, 12, 30, 32),
    }),
    exercise({
      id: "ex-crucifixo",
      position: 3,
      namePt: "Crucifixo na Máquina",
      muscleGroup: "Peitoral",
      imageSrc: "/catalog/thumb-supino.webp",
      restSeconds: 90,
      methodKind: "working",
      groupId: null,
      loadStepKg: 2.5,
      sets: workingBlock("ex3", 3, 12, 15, 60, 60),
    }),
    exercise({
      id: "ex-triceps-pulley",
      position: 4,
      namePt: "Tríceps Pulley",
      muscleGroup: "Tríceps",
      imageSrc: "/icons/body-placeholder.svg",
      restSeconds: 90,
      methodKind: "working",
      groupId: null,
      loadStepKg: 1,
      sets: workingBlock("ex4", 3, 10, 12, 25, 27),
    }),
    exercise({
      id: "ex-triceps-testa",
      position: 5,
      namePt: "Tríceps Testa",
      muscleGroup: "Tríceps",
      imageSrc: "/icons/body-placeholder.svg",
      restSeconds: 90,
      methodKind: "working",
      groupId: null,
      loadStepKg: 1,
      sets: workingBlock("ex5", 3, 10, 12, 30, 30),
    }),
    exercise({
      id: "ex-mergulho",
      position: 6,
      namePt: "Mergulho em Paralelas",
      muscleGroup: "Tríceps",
      imageSrc: "/icons/body-placeholder.svg",
      restSeconds: 120,
      methodKind: "working",
      groupId: null,
      loadStepKg: 1,
      previousLabel: "Peso corporal",
      suggestedLabel: "+4kg",
      sets: workingBlock("ex6", 3, 8, 10, null, 4).map((row) => ({
        ...row,
        weightLabel: "Peso corporal",
      })),
    }),
  ],
};
