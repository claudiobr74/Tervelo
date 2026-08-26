"use client";

import { useSyncExternalStore } from "react";
import { recordPostWorkoutCheckout } from "@/application/use-cases/record-post-workout-checkout";
import { recordPreWorkoutCheckin } from "@/application/use-cases/record-pre-workout-checkin";
import type {
  PostWorkoutCheckoutRecord,
  PostWorkoutCheckoutRepository,
  PreWorkoutCheckinRecord,
  PreWorkoutCheckinRepository,
} from "@/application/ports";
import { enqueueAthleteMutation, type QueuedAthleteMutation } from "@/domain/athlete-state/offline-queue";
import type { PostWorkoutCheckout } from "@/domain/athlete-state/post-workout";
import type { PreWorkoutCheckin } from "@/domain/athlete-state/pre-workout";
import { CHANGE_SCOPE_COPY } from "@/domain/athlete-state/labels";
import type { ChangeScope } from "@/domain/athlete-state/types";
import { PREVIEW_TRAINING_USER_ID } from "@/lib/training/preview-workout";

export const ATHLETE_STATE_STORE_KEY = "tervelo-athlete-state";

export type WeeklyReviewPreview = {
  id: string;
  dateLabel: string;
  headline: string;
  decision: ChangeScope;
  overview: string;
  whatImproved: string;
  whatNeedsAttention: string;
  training: string;
  nutrition: string;
  body: string | null;
  recovery: string;
  heartRate: string | null;
  nextWeek: string;
};

export type TodayAdjustment = {
  whatChanged: string;
  whyChanged: string;
  dataConsidered: string;
  onlyToday: boolean;
  reevaluateWhen: string;
} | null;

export type AthleteStateStore = {
  todayDate: string;
  preWorkout: PreWorkoutCheckin | null;
  postWorkout: PostWorkoutCheckout | null;
  queue: QueuedAthleteMutation[];
  weeklyReviews: WeeklyReviewPreview[];
  todayAdjustment: TodayAdjustment;
  sessionKeptCopy: string | null;
};

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function seedReviews(): WeeklyReviewPreview[] {
  return [
    {
      id: "rev-26",
      dateLabel: "26 ago",
      headline: "Semana consistente",
      decision: "SEM_MUDANCA",
      overview:
        "Você completou as quatro sessões planejadas e apresentou progressão em três exercícios. Sua recuperação permaneceu próxima ao seu padrão habitual e a estratégia nutricional apresentou boa aderência. Não há justificativa pelos dados atuais para modificar o bloco.",
      whatImproved: "Progressão em três exercícios comparáveis.",
      whatNeedsAttention: "Nada neste recorte pede mudança estrutural.",
      training: "O planejamento atual continua funcionando para este atleta.",
      nutrition: "Sua ingestão de proteína permaneceu próxima ao planejamento na maior parte da semana.",
      body: null,
      recovery: "A recuperação permaneceu próxima ao seu padrão habitual.",
      heartRate: null,
      nextWeek: "Manter o plano e observar a resposta.",
    },
    {
      id: "rev-19",
      dateLabel: "19 ago",
      headline: "Recuperação reduzida",
      decision: "AJUSTE_DA_SEMANA",
      overview:
        "Nas últimas duas semanas houve queda de desempenho acompanhada por maior percepção de esforço e recuperação abaixo do seu padrão habitual. A aderência nutricional permaneceu adequada.",
      whatImproved: "A aderência às sessões permanece utilizável para decidir com segurança.",
      whatNeedsAttention: "Sono, energia e recuperação muscular ficaram abaixo do habitual.",
      training: "Volume da semana foi redistribuído de forma temporária.",
      nutrition: "A estratégia nutricional não aparece como o limitante principal.",
      body: null,
      recovery: "A recuperação ficou abaixo do seu padrão habitual.",
      heartRate: null,
      nextWeek: "Reavaliar volume no fechamento da próxima semana.",
    },
    {
      id: "rev-12",
      dateLabel: "12 ago",
      headline: "Progressão adequada",
      decision: "SEM_MUDANCA",
      overview:
        "Embora seu peso esteja praticamente estável, cintura e dobras diminuíram enquanto seu desempenho melhorou. O conjunto dos dados favorece manter a estratégia atual.",
      whatImproved: "Desempenho em alta, com medidas corporais no sentido do objetivo.",
      whatNeedsAttention: "Nada neste recorte pede troca de bloco.",
      training: "Manter treino.",
      nutrition: "Manter estratégia nutricional.",
      body: "Peso estável não contradiz a recomposição quando cintura e dobras caem juntos.",
      recovery: "Recuperação compatível com o padrão habitual.",
      heartRate: null,
      nextWeek: "Seguir o plano e observar a mesma tendência.",
    },
  ];
}

const EMPTY: AthleteStateStore = {
  todayDate: todayIsoDate(),
  preWorkout: null,
  postWorkout: null,
  queue: [],
  weeklyReviews: seedReviews(),
  todayAdjustment: null,
  sessionKeptCopy: null,
};

const listeners = new Set<() => void>();
let cached: AthleteStateStore = EMPTY;
let hydrated = false;

function emit() {
  for (const listener of listeners) listener();
}

function persist(next: AthleteStateStore) {
  cached = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(ATHLETE_STATE_STORE_KEY, JSON.stringify(next));
  }
  emit();
}

function readStored(): AthleteStateStore {
  if (typeof window === "undefined") return { ...EMPTY, weeklyReviews: seedReviews() };
  try {
    const raw = window.localStorage.getItem(ATHLETE_STATE_STORE_KEY);
    if (!raw) return { ...EMPTY, weeklyReviews: seedReviews() };
    const parsed = JSON.parse(raw) as Partial<AthleteStateStore>;
    const today = todayIsoDate();
    const staleDay = parsed.todayDate !== today;
    return {
      todayDate: today,
      preWorkout: staleDay ? null : (parsed.preWorkout ?? null),
      postWorkout: staleDay ? null : (parsed.postWorkout ?? null),
      queue: Array.isArray(parsed.queue) ? parsed.queue : [],
      weeklyReviews: parsed.weeklyReviews?.length ? parsed.weeklyReviews : seedReviews(),
      todayAdjustment: staleDay ? null : (parsed.todayAdjustment ?? null),
      sessionKeptCopy: staleDay ? null : (parsed.sessionKeptCopy ?? null),
    };
  } catch {
    return { ...EMPTY, weeklyReviews: seedReviews() };
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  cached = readStored();
}

export function getAthleteStateStore(): AthleteStateStore {
  hydrate();
  return cached;
}

export function subscribeAthleteStateStore(listener: () => void): () => void {
  hydrate();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAthleteStateStore(): AthleteStateStore {
  return useSyncExternalStore(subscribeAthleteStateStore, getAthleteStateStore, () => EMPTY);
}

const preRepo: PreWorkoutCheckinRepository = {
  async findByClientMutationId(id) {
    hydrate();
    const match = cached.queue.find(
      (item) => item.kind === "pre_workout_checkin" && item.clientMutationId === id,
    );
    if (!match) return null;
    return {
      id,
      userId: PREVIEW_TRAINING_USER_ID,
      clientMutationId: id,
      status: (match.payload.status as "completed" | "skipped") ?? "skipped",
      checkedInAt: new Date().toISOString(),
    };
  },
  async insert(row) {
    return { ...row, id: crypto.randomUUID() };
  },
};

const postRepo: PostWorkoutCheckoutRepository = {
  async findByClientMutationId(id) {
    hydrate();
    const match = cached.queue.find(
      (item) => item.kind === "post_workout_checkout" && item.clientMutationId === id,
    );
    if (!match) return null;
    return {
      id,
      userId: PREVIEW_TRAINING_USER_ID,
      clientMutationId: id,
      status: (match.payload.status as "completed" | "skipped") ?? "skipped",
      checkedOutAt: new Date().toISOString(),
    };
  },
  async insert(row) {
    return { ...row, id: crypto.randomUUID() };
  },
};

export async function savePreWorkoutCheckin(checkin: PreWorkoutCheckin): Promise<PreWorkoutCheckinRecord | null> {
  hydrate();
  const clientMutationId = crypto.randomUUID();
  const result = await recordPreWorkoutCheckin(preRepo, {
    userId: PREVIEW_TRAINING_USER_ID,
    clientMutationId,
    status: checkin.status,
    sleepQuality: checkin.sleepQuality ?? undefined,
    energy: checkin.energy ?? undefined,
    muscleRecovery: checkin.muscleRecovery ?? undefined,
    stress: checkin.stress ?? undefined,
    hasPain: checkin.hasPain ?? undefined,
    availableMinutes: checkin.availableMinutes ?? undefined,
  });
  const queue = enqueueAthleteMutation(cached.queue, {
    clientMutationId,
    kind: "pre_workout_checkin",
    payload: { ...checkin },
  });
  persist({
    ...cached,
    preWorkout: checkin,
    queue,
    sessionKeptCopy:
      checkin.status === "completed" && checkin.hasPain !== true && (checkin.availableMinutes == null || checkin.hasPlannedTime)
        ? "Treino mantido conforme planejado."
        : cached.sessionKeptCopy,
  });
  return result.ok ? result.value : null;
}

export async function savePostWorkoutCheckout(checkout: PostWorkoutCheckout): Promise<PostWorkoutCheckoutRecord | null> {
  hydrate();
  const clientMutationId = crypto.randomUUID();
  const result = await recordPostWorkoutCheckout(postRepo, {
    userId: PREVIEW_TRAINING_USER_ID,
    clientMutationId,
    status: checkout.status,
    expectation: checkout.expectation ?? undefined,
    difficulty: checkout.difficulty ?? undefined,
    planCompletion: checkout.planCompletion ?? undefined,
    partialReasons: checkout.partialReasons,
    hadPain: checkout.hadPain ?? undefined,
  });
  const queue = enqueueAthleteMutation(cached.queue, {
    clientMutationId,
    kind: "post_workout_checkout",
    payload: { ...checkout },
  });
  persist({ ...cached, postWorkout: checkout, queue });
  return result.ok ? result.value : null;
}

export function setTodayAdjustment(adjustment: TodayAdjustment) {
  hydrate();
  persist({ ...cached, todayAdjustment: adjustment });
}

export function setSessionKeptCopy(copy: string | null) {
  hydrate();
  persist({ ...cached, sessionKeptCopy: copy });
}

export function weeklyDecisionLabel(decision: ChangeScope): string {
  return CHANGE_SCOPE_COPY[decision];
}

export function trackProductEvent(event: string) {
  void event;
}
