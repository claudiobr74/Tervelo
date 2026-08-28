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
import {
  enqueueAthleteMutation,
  type QueuedAthleteMutation,
} from "@/domain/athlete-state/offline-queue";
import type { PostWorkoutCheckout } from "@/domain/athlete-state/post-workout";
import type { PreWorkoutCheckin } from "@/domain/athlete-state/pre-workout";
import { CHANGE_SCOPE_COPY } from "@/domain/athlete-state/labels";
import type { ChangeScope } from "@/domain/athlete-state/types";
import { KV_KEYS, scheduleKvWrite } from "@/lib/offline/idb";
import { enqueueSync } from "@/lib/offline/queue-store";
import { currentOfflineUserId } from "@/lib/offline/user-scope";

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

const INVENTED_REVIEW_IDS = new Set(["rev-26", "rev-19", "rev-12"]);

function storedReviews(list: unknown): WeeklyReviewPreview[] {
  if (!Array.isArray(list)) return [];
  return list.filter((item): item is WeeklyReviewPreview => {
    if (!item || typeof item !== "object" || !("id" in item)) return false;
    return !INVENTED_REVIEW_IDS.has(String((item as WeeklyReviewPreview).id));
  });
}

const EMPTY: AthleteStateStore = {
  todayDate: todayIsoDate(),
  preWorkout: null,
  postWorkout: null,
  queue: [],
  weeklyReviews: [],
  todayAdjustment: null,
  sessionKeptCopy: null,
};

const listeners = new Set<() => void>();
let cached: AthleteStateStore = EMPTY;
let hydrated = false;
let mutatedSinceBoot = false;

function emit() {
  for (const listener of listeners) listener();
}

function persist(next: AthleteStateStore) {
  cached = next;
  mutatedSinceBoot = true;
  if (typeof window !== "undefined") {
    scheduleKvWrite(currentOfflineUserId(), KV_KEYS.athleteState, next);
  }
  emit();
}

function readStored(): AthleteStateStore {
  if (typeof window === "undefined") return { ...EMPTY, weeklyReviews: [] };
  try {
    const raw = window.localStorage.getItem(ATHLETE_STATE_STORE_KEY);
    if (!raw) return { ...EMPTY, weeklyReviews: [] };
    const parsed = JSON.parse(raw) as Partial<AthleteStateStore>;
    const today = todayIsoDate();
    const staleDay = parsed.todayDate !== today;
    return {
      todayDate: today,
      preWorkout: staleDay ? null : (parsed.preWorkout ?? null),
      postWorkout: staleDay ? null : (parsed.postWorkout ?? null),
      queue: Array.isArray(parsed.queue) ? parsed.queue : [],
      weeklyReviews: storedReviews(parsed.weeklyReviews),
      todayAdjustment: staleDay ? null : (parsed.todayAdjustment ?? null),
      sessionKeptCopy: staleDay ? null : (parsed.sessionKeptCopy ?? null),
    };
  } catch {
    return { ...EMPTY, weeklyReviews: [] };
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  cached = readStored();
}

export function hydrateAthleteStateFromDurable(state: AthleteStateStore) {
  if (mutatedSinceBoot) return;
  const today = todayIsoDate();
  const staleDay = state.todayDate !== today;
  cached = {
    todayDate: today,
    preWorkout: staleDay ? null : (state.preWorkout ?? null),
    postWorkout: staleDay ? null : (state.postWorkout ?? null),
    queue: Array.isArray(state.queue) ? state.queue : [],
    weeklyReviews: storedReviews(state.weeklyReviews),
    todayAdjustment: staleDay ? null : (state.todayAdjustment ?? null),
    sessionKeptCopy: staleDay ? null : (state.sessionKeptCopy ?? null),
  };
  hydrated = true;
  emit();
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
      userId: currentOfflineUserId(),
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
      userId: currentOfflineUserId(),
      clientMutationId: id,
      status: (match.payload.status as "completed" | "skipped") ?? "skipped",
      checkedOutAt: new Date().toISOString(),
    };
  },
  async insert(row) {
    return { ...row, id: crypto.randomUUID() };
  },
};

export async function savePreWorkoutCheckin(
  checkin: PreWorkoutCheckin,
): Promise<PreWorkoutCheckinRecord | null> {
  hydrate();
  const clientMutationId = crypto.randomUUID();
  const result = await recordPreWorkoutCheckin(preRepo, {
    userId: currentOfflineUserId(),
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
  enqueueSync({
    id: clientMutationId,
    tipo: "PRE_WORKOUT_CHECKIN_COMPLETED",
    entidade: "pre_workout_checkin",
    entity_id: clientMutationId,
    client_mutation_id: clientMutationId,
    occurred_at: new Date().toISOString(),
    user_id: currentOfflineUserId(),
    payload: { ...checkin },
  });
  persist({
    ...cached,
    preWorkout: checkin,
    queue,
    sessionKeptCopy:
      checkin.status === "completed" &&
      checkin.hasPain !== true &&
      (checkin.availableMinutes == null || checkin.hasPlannedTime)
        ? "Treino mantido conforme planejado."
        : cached.sessionKeptCopy,
  });
  return result.ok ? result.value : null;
}

export async function savePostWorkoutCheckout(
  checkout: PostWorkoutCheckout,
): Promise<PostWorkoutCheckoutRecord | null> {
  hydrate();
  const clientMutationId = crypto.randomUUID();
  const result = await recordPostWorkoutCheckout(postRepo, {
    userId: currentOfflineUserId(),
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
  enqueueSync({
    id: clientMutationId,
    tipo: "POST_WORKOUT_CHECKIN_COMPLETED",
    entidade: "post_workout_checkout",
    entity_id: clientMutationId,
    client_mutation_id: clientMutationId,
    occurred_at: new Date().toISOString(),
    user_id: currentOfflineUserId(),
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
