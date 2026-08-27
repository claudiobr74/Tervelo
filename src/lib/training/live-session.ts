"use client";

import { useSyncExternalStore } from "react";
import {
  adjustRestTimer,
  pauseRestTimer,
  remainingSeconds,
  restartRestTimer,
  resumeRestTimer,
  skipRestTimer,
  startRestTimer,
  tickRestTimer,
  type RestTimer,
} from "@/domain/timer/rest-timer";
import type { WorkoutTimelineEvent } from "@/domain/heart-rate/types";
import { enqueueSetResult, type QueuedSetResult } from "@/domain/training/offline-queue";
import {
  currentExercise,
  currentSet,
  isSessionComplete,
  restSecondsAfter,
  type RecordedSet,
  type SetPrescription,
} from "@/domain/training/session";
import { KV_KEYS, scheduleKvWrite } from "@/lib/offline/idb";
import { enqueueSync } from "@/lib/offline/queue-store";
import { currentOfflineUserId } from "@/lib/offline/user-scope";
import { PREVIEW_WORKOUT } from "@/lib/training/preview-workout";

export const LIVE_SESSION_KEY = "tervelo-live-session";
export const SET_RESULT_QUEUE_KEY = "tervelo-set-result-queue";

export const previewWorkout = PREVIEW_WORKOUT;

export type LiveStatus = "idle" | "active" | "resting" | "completed";
export type AfterRecord = "exercise" | "rest" | "summary";

type SerializedTimer = {
  startedAt: string;
  expectedEndAt: string;
  durationSeconds: number;
  pausedAt: string | null;
  remainingAtPauseSeconds: number | null;
  status: RestTimer["status"];
};

export type LiveSessionState = {
  status: LiveStatus;
  recorded: RecordedSet[];
  timer: SerializedTimer | null;
  startedAt: string | null;
  completedAt: string | null;
  currentSetStartedAt: string | null;
  events: WorkoutTimelineEvent[];
  loadKg: number;
  reps: number;
  rir: number;
  boundSetId: string | null;
  queue: QueuedSetResult[];
  syncSessionId: string | null;
  completeSyncId: string | null;
};

const IDLE: LiveSessionState = {
  status: "idle",
  recorded: [],
  timer: null,
  startedAt: null,
  completedAt: null,
  currentSetStartedAt: null,
  events: [],
  loadKg: 80,
  reps: 8,
  rir: 2,
  boundSetId: null,
  queue: [],
  syncSessionId: null,
  completeSyncId: null,
};

const listeners = new Set<() => void>();
let cached: LiveSessionState = IDLE;
let hydrated = false;
let mutatedSinceBoot = false;
let durableTimer: ReturnType<typeof setTimeout> | null = null;

function emit() {
  for (const listener of listeners) listener();
}

function serializeTimer(timer: RestTimer): SerializedTimer {
  return {
    startedAt: timer.startedAt.toISOString(),
    expectedEndAt: timer.expectedEndAt.toISOString(),
    durationSeconds: timer.durationSeconds,
    pausedAt: timer.pausedAt ? timer.pausedAt.toISOString() : null,
    remainingAtPauseSeconds: timer.remainingAtPauseSeconds,
    status: timer.status,
  };
}

export function deserializeTimer(raw: SerializedTimer): RestTimer {
  return {
    startedAt: new Date(raw.startedAt),
    expectedEndAt: new Date(raw.expectedEndAt),
    durationSeconds: raw.durationSeconds,
    pausedAt: raw.pausedAt ? new Date(raw.pausedAt) : null,
    remainingAtPauseSeconds: raw.remainingAtPauseSeconds,
    status: raw.status,
  };
}

function inputsFromSet(set: SetPrescription): Pick<LiveSessionState, "loadKg" | "reps" | "rir" | "boundSetId"> {
  return {
    loadKg: set.suggestedWeightKg ?? set.targetWeightKg ?? set.previousWeightKg ?? 0,
    reps: set.targetRepsMin,
    rir: Math.min(4, Math.max(0, set.targetRepsInReserve)),
    boundSetId: set.id,
  };
}

function writeDurable(state: LiveSessionState) {
  if (typeof window === "undefined") return;
  scheduleKvWrite(currentOfflineUserId(), KV_KEYS.liveSession, state);
}

function persist(next: LiveSessionState, immediate = true) {
  cached = next;
  mutatedSinceBoot = true;
  emit();
  if (immediate) {
    if (durableTimer) {
      clearTimeout(durableTimer);
      durableTimer = null;
    }
    writeDurable(next);
    return;
  }
  if (durableTimer) clearTimeout(durableTimer);
  durableTimer = setTimeout(() => {
    durableTimer = null;
    writeDurable(cached);
  }, 300);
}

function readStored(): LiveSessionState {
  if (typeof window === "undefined") return IDLE;
  try {
    const raw = window.localStorage.getItem(LIVE_SESSION_KEY);
    if (!raw) return IDLE;
    const parsed = JSON.parse(raw) as Partial<LiveSessionState>;
    return {
      ...IDLE,
      ...parsed,
      recorded: Array.isArray(parsed.recorded) ? parsed.recorded : [],
      queue: Array.isArray(parsed.queue) ? parsed.queue : [],
      events: Array.isArray(parsed.events) ? parsed.events : [],
      syncSessionId: parsed.syncSessionId ?? null,
      completeSyncId: parsed.completeSyncId ?? null,
    };
  } catch {
    return IDLE;
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  cached = readStored();
}

function withCurrentInputs(state: LiveSessionState): LiveSessionState {
  if (state.status !== "active" && state.status !== "resting") return state;
  if (isSessionComplete(PREVIEW_WORKOUT, state.recorded)) return state;
  const set = currentSet(PREVIEW_WORKOUT, state.recorded);
  if (state.boundSetId === set.id) return state;
  return { ...state, ...inputsFromSet(set) };
}

export function getLiveSession(): LiveSessionState {
  hydrate();
  return cached;
}

export function getServerLiveSession(): LiveSessionState {
  return IDLE;
}

export function subscribeLiveSession(listener: () => void): () => void {
  hydrate();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function hydrateLiveSessionFromDurable(state: LiveSessionState) {
  if (mutatedSinceBoot) return;
  cached = withCurrentInputs({
    ...IDLE,
    ...state,
    recorded: Array.isArray(state.recorded) ? state.recorded : [],
    queue: Array.isArray(state.queue) ? state.queue : [],
    events: Array.isArray(state.events) ? state.events : [],
    syncSessionId: state.syncSessionId ?? null,
    completeSyncId: state.completeSyncId ?? null,
  });
  hydrated = true;
  emit();
}

export function isLiveSessionInProgress(state: LiveSessionState = cached): boolean {
  return state.status === "active" || state.status === "resting";
}

export function startWorkout(): LiveSessionState {
  hydrate();
  if (cached.status === "active" || cached.status === "resting") {
    return cached;
  }
  const firstExercise = currentExercise(PREVIEW_WORKOUT, []);
  const first = currentSet(PREVIEW_WORKOUT, []);
  const at = new Date().toISOString();
  const syncSessionId = crypto.randomUUID();
  enqueueSync({
    id: syncSessionId,
    tipo: "SESSION_STARTED",
    entidade: "training_session",
    entity_id: PREVIEW_WORKOUT.id,
    client_mutation_id: syncSessionId,
    occurred_at: at,
    user_id: currentOfflineUserId(),
    payload: { workoutId: PREVIEW_WORKOUT.id, programVersion: "preview-1" },
  });
  scheduleKvWrite(currentOfflineUserId(), KV_KEYS.prescriptionSnapshot, {
    sessionId: PREVIEW_WORKOUT.id,
    programVersion: "preview-1",
    frozenAt: at,
    workout: PREVIEW_WORKOUT,
  });
  const next: LiveSessionState = {
    ...IDLE,
    status: "active",
    startedAt: at,
    currentSetStartedAt: at,
    events: [
      { type: "SESSION_STARTED", at },
      { type: "EXERCISE_STARTED", at, exerciseId: firstExercise.id },
      { type: "SET_STARTED", at, setId: first.id, exerciseId: firstExercise.id },
    ],
    queue: cached.queue,
    syncSessionId,
    ...inputsFromSet(first),
  };
  persist(next);
  return next;
}

function completeSession(state: LiveSessionState): LiveSessionState {
  const at = state.completedAt ?? new Date().toISOString();
  const last = state.recorded.at(-1);
  const extra: WorkoutTimelineEvent[] = [];
  if (last) {
    extra.push({ type: "EXERCISE_COMPLETED", at, exerciseId: last.sessionExerciseId, setId: last.setId });
  }
  extra.push({ type: "SESSION_COMPLETED", at });
  const completeSyncId = state.completeSyncId ?? crypto.randomUUID();
  enqueueSync({
    id: completeSyncId,
    tipo: "SESSION_COMPLETED",
    entidade: "training_session",
    entity_id: PREVIEW_WORKOUT.id,
    client_mutation_id: completeSyncId,
    occurred_at: at,
    user_id: currentOfflineUserId(),
    dependency_ids: state.syncSessionId ? [state.syncSessionId] : [],
    payload: { startedAt: state.startedAt, completedAt: at },
  });
  return {
    ...state,
    status: "completed",
    timer: null,
    completedAt: at,
    currentSetStartedAt: null,
    completeSyncId,
    events: [...state.events, ...extra],
  };
}

export function endActiveSession(): LiveSessionState {
  hydrate();
  if (cached.status === "idle" || cached.status === "completed") return cached;
  const next = completeSession(cached);
  persist(next);
  return next;
}

function startNextSetEvents(recorded: RecordedSet[], at: string): WorkoutTimelineEvent[] {
  if (isSessionComplete(PREVIEW_WORKOUT, recorded)) return [];
  const previous = recorded.at(-1);
  const exercise = currentExercise(PREVIEW_WORKOUT, recorded);
  const set = currentSet(PREVIEW_WORKOUT, recorded);
  const events: WorkoutTimelineEvent[] = [];
  if (previous && previous.sessionExerciseId !== exercise.id) {
    events.push({ type: "EXERCISE_COMPLETED", at, exerciseId: previous.sessionExerciseId, setId: previous.setId });
    events.push({ type: "EXERCISE_STARTED", at, exerciseId: exercise.id });
  }
  events.push({ type: "SET_STARTED", at, setId: set.id, exerciseId: exercise.id });
  return events;
}

export function recordCurrentSet(): AfterRecord {
  hydrate();
  const session = PREVIEW_WORKOUT;
  if (isSessionComplete(session, cached.recorded)) {
    persist(completeSession(cached));
    return "summary";
  }
  const exercise = currentExercise(session, cached.recorded);
  const set = currentSet(session, cached.recorded);
  const performedAt = new Date().toISOString();
  const recorded: RecordedSet = {
    setId: set.id,
    sessionExerciseId: exercise.id,
    clientMutationId: crypto.randomUUID(),
    weightKg: cached.loadKg,
    reps: cached.reps,
    repsInReserve: set.methodKind === "warmup" ? null : cached.rir,
    methodKind: set.methodKind,
    performedAt,
  };
  const recordedAll = [...cached.recorded, recorded];
  const queued = enqueueSetResult(cached.queue, {
    clientMutationId: recorded.clientMutationId,
    userId: currentOfflineUserId(),
    setId: recorded.setId,
    weightKg: recorded.weightKg ?? undefined,
    reps: recorded.reps,
    repsInReserve: recorded.repsInReserve ?? undefined,
    methodKind: recorded.methodKind,
    performedAt,
  });
  enqueueSync({
    id: recorded.clientMutationId,
    tipo: "SET_COMPLETED",
    entidade: "set_result",
    entity_id: recorded.setId,
    client_mutation_id: recorded.clientMutationId,
    occurred_at: performedAt,
    user_id: currentOfflineUserId(),
    dependency_ids: cached.syncSessionId ? [cached.syncSessionId] : [],
    payload: {
      setId: recorded.setId,
      weightKg: recorded.weightKg,
      reps: recorded.reps,
      repsInReserve: recorded.repsInReserve,
      methodKind: recorded.methodKind,
    },
  });
  const timeline: WorkoutTimelineEvent[] = [
    ...cached.events,
    { type: "SET_COMPLETED", at: performedAt, setId: set.id, exerciseId: exercise.id },
  ];
  if (isSessionComplete(session, recordedAll)) {
    persist(completeSession({ ...cached, recorded: recordedAll, queue: queued, timer: null, events: timeline }));
    return "summary";
  }
  const rest = restSecondsAfter(session, recordedAll);
  if (rest && rest > 0) {
    persist({
      ...cached,
      recorded: recordedAll,
      queue: queued,
      status: "resting",
      timer: serializeTimer(startRestTimer(new Date(), rest)),
      events: [...timeline, { type: "REST_STARTED", at: performedAt, setId: set.id, exerciseId: exercise.id }],
      currentSetStartedAt: null,
      ...inputsFromSet(currentSet(session, recordedAll)),
    });
    return "rest";
  }
  persist({
    ...cached,
    recorded: recordedAll,
    queue: queued,
    status: "active",
    timer: null,
    events: [...timeline, ...startNextSetEvents(recordedAll, performedAt)],
    currentSetStartedAt: performedAt,
    ...inputsFromSet(currentSet(session, recordedAll)),
  });
  return "exercise";
}

function mutateTimer(map: (timer: RestTimer, now: Date) => RestTimer) {
  hydrate();
  if (!cached.timer) return;
  const now = new Date();
  const next = map(deserializeTimer(cached.timer), now);
  persist({ ...cached, timer: serializeTimer(next) });
}

export function pauseOrResumeTimer() {
  mutateTimer((timer, now) => (timer.status === "paused" ? resumeRestTimer(timer, now) : pauseRestTimer(timer, now)));
}

export function restartTimer() {
  mutateTimer((timer, now) => restartRestTimer(timer, now));
}

export function adjustTimer(deltaSeconds: number) {
  mutateTimer((timer, now) => adjustRestTimer(timer, now, deltaSeconds));
}

export function skipRest(): AfterRecord {
  hydrate();
  const at = new Date().toISOString();
  const restDone: WorkoutTimelineEvent = { type: "REST_COMPLETED", at };
  if (cached.timer) {
    const skipped = skipRestTimer(deserializeTimer(cached.timer), new Date());
    if (isSessionComplete(PREVIEW_WORKOUT, cached.recorded)) {
      persist(completeSession({ ...cached, timer: serializeTimer(skipped), events: [...cached.events, restDone] }));
      return "summary";
    }
    persist({
      ...withCurrentInputs({
        ...cached,
        status: "active",
        timer: serializeTimer(skipped),
        currentSetStartedAt: at,
        events: [...cached.events, restDone, ...startNextSetEvents(cached.recorded, at)],
      }),
    });
    return "exercise";
  }
  persist({
    ...withCurrentInputs({
      ...cached,
      status: "active",
      timer: null,
      currentSetStartedAt: at,
      events: [...cached.events, restDone, ...startNextSetEvents(cached.recorded, at)],
    }),
  });
  return "exercise";
}

export function beginNextSet(): AfterRecord {
  hydrate();
  const at = new Date().toISOString();
  if (isSessionComplete(PREVIEW_WORKOUT, cached.recorded)) {
    persist(completeSession(cached));
    return "summary";
  }
  persist({
    ...withCurrentInputs({
      ...cached,
      status: "active",
      timer: null,
      currentSetStartedAt: at,
      events: [...cached.events, { type: "REST_COMPLETED", at }, ...startNextSetEvents(cached.recorded, at)],
    }),
  });
  return "exercise";
}

export function tickTimer(now = new Date()) {
  hydrate();
  if (!cached.timer || cached.status !== "resting") return;
  const ticked = tickRestTimer(deserializeTimer(cached.timer), now);
  if (ticked.status === cached.timer.status && remainingSeconds(ticked, now) === remainingSeconds(deserializeTimer(cached.timer), now)) {
    return;
  }
  persist({ ...cached, timer: serializeTimer(ticked) }, false);
}

export function setLoadKg(value: number) {
  hydrate();
  persist({ ...cached, loadKg: Math.max(0, Math.round(value * 4) / 4) });
}

export function setReps(value: number) {
  hydrate();
  persist({ ...cached, reps: Math.max(0, Math.trunc(value)) });
}

export function setRir(value: number) {
  hydrate();
  persist({ ...cached, rir: Math.min(4, Math.max(0, value)) });
}

export function stepLoad(delta: number) {
  hydrate();
  setLoadKg(cached.loadKg + delta);
}

export function stepReps(delta: number) {
  hydrate();
  setReps(cached.reps + delta);
}

export function useLiveSession(): LiveSessionState {
  return useSyncExternalStore(subscribeLiveSession, getLiveSession, getServerLiveSession);
}
