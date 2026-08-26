import { insertHeartRateSamples, upsertHeartRateSession, upsertWearableDevice } from "./sync";
import type { BufferedHeartRateSample } from "@/domain/heart-rate/buffer";
import {
  enqueueHeartRateSamples,
  flushHeartRateQueue,
  pendingHeartRateCount,
  shouldFlush,
} from "@/domain/heart-rate/buffer";
import { HEART_RATE_PROCESSING_VERSION } from "@/domain/heart-rate/types";
import type { HeartRateSample, HeartRateSessionStats } from "@/domain/heart-rate/types";

export const HEART_RATE_SESSION_KEY = "tervelo-heart-rate-session";

export type StoredWearable = {
  id: string;
  provider: "web_bluetooth";
  displayName: string;
  deviceType: "heart_rate_monitor";
  lastConnectedAt: string;
  isActive: boolean;
};

export type StoredHeartRateSession = {
  id: string;
  userId: string;
  trainingSessionId: string;
  wearableDeviceId: string | null;
  startedAt: string | null;
  endedAt: string | null;
  stats: HeartRateSessionStats | null;
  processingVersion: string;
  queue: BufferedHeartRateSample[];
  lastFlushAtMs: number | null;
  lastExerciseId: string | null;
};

const EMPTY_SESSION: StoredHeartRateSession = {
  id: "",
  userId: "",
  trainingSessionId: "",
  wearableDeviceId: null,
  startedAt: null,
  endedAt: null,
  stats: null,
  processingVersion: HEART_RATE_PROCESSING_VERSION,
  queue: [],
  lastFlushAtMs: null,
  lastExerciseId: null,
};

const listeners = new Set<() => void>();
let cached: StoredHeartRateSession = EMPTY_SESSION;
let wearable: StoredWearable | null = null;
let hydrated = false;

function emit() {
  for (const listener of listeners) listener();
}

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    HEART_RATE_SESSION_KEY,
    JSON.stringify({ session: cached, wearable }),
  );
  emit();
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(HEART_RATE_SESSION_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as { session?: StoredHeartRateSession; wearable?: StoredWearable | null };
    if (parsed.session) cached = { ...EMPTY_SESSION, ...parsed.session, queue: parsed.session.queue ?? [] };
    wearable = parsed.wearable ?? null;
  } catch {
    cached = EMPTY_SESSION;
    wearable = null;
  }
}

export function subscribeHeartRateSession(listener: () => void): () => void {
  hydrate();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getHeartRateSession(): StoredHeartRateSession {
  hydrate();
  return cached;
}

export function getWearableDevice(): StoredWearable | null {
  hydrate();
  return wearable;
}

export function getServerHeartRateSession(): StoredHeartRateSession {
  return EMPTY_SESSION;
}

export function rememberWearable(displayName: string) {
  hydrate();
  const now = new Date().toISOString();
  if (wearable && wearable.displayName !== displayName) {
    wearable = {
      id: crypto.randomUUID(),
      provider: "web_bluetooth",
      displayName,
      deviceType: "heart_rate_monitor",
      lastConnectedAt: now,
      isActive: true,
    };
  } else if (wearable) {
    wearable = { ...wearable, lastConnectedAt: now, isActive: true };
  } else {
    wearable = {
      id: crypto.randomUUID(),
      provider: "web_bluetooth",
      displayName,
      deviceType: "heart_rate_monitor",
      lastConnectedAt: now,
      isActive: true,
    };
  }
  persist();
  void upsertWearableDevice(wearable);
}

export function deactivateWearable() {
  hydrate();
  if (!wearable) return;
  wearable = { ...wearable, isActive: false };
  persist();
}

export function beginHeartRateCapture(input: { userId: string; trainingSessionId: string; startedAt: string }) {
  hydrate();
  cached = {
    ...EMPTY_SESSION,
    id: crypto.randomUUID(),
    userId: input.userId,
    trainingSessionId: input.trainingSessionId,
    wearableDeviceId: wearable?.id ?? null,
    startedAt: input.startedAt,
    processingVersion: HEART_RATE_PROCESSING_VERSION,
  };
  persist();
}

export function appendHeartRateSample(sample: HeartRateSample) {
  hydrate();
  if (!cached.id) return;
  const buffered: BufferedHeartRateSample = {
    ...sample,
    clientMutationId: sample.id,
    status: "pending",
  };
  cached = { ...cached, queue: enqueueHeartRateSamples(cached.queue, [buffered]) };
  persist();
}

export function markHeartRateSessionEnded(endedAt: string, stats: HeartRateSessionStats) {
  hydrate();
  cached = { ...cached, endedAt, stats };
  persist();
}

export function setLastExerciseId(exerciseId: string | null) {
  hydrate();
  cached = { ...cached, lastExerciseId: exerciseId };
  persist();
}

export function samplesFromQueue(): HeartRateSample[] {
  hydrate();
  return cached.queue.map((row) => ({
    id: row.id,
    recordedAt: row.recordedAt,
    bpm: row.bpm,
    source: row.source,
    isValid: row.isValid,
    quality: row.quality,
    qualityReason: row.qualityReason,
    exerciseId: row.exerciseId,
    setId: row.setId,
  }));
}

export async function flushStoredHeartRate(trigger: "interval" | "exercise_change" | "session_end" | "online") {
  hydrate();
  if (!cached.id || cached.queue.length === 0) return;
  if (
    !shouldFlush({
      pendingCount: pendingHeartRateCount(cached.queue),
      trigger,
      lastFlushAtMs: cached.lastFlushAtMs,
      nowMs: Date.now(),
    })
  ) {
    return;
  }
  const queue = await flushHeartRateQueue(cached.queue, async (batch) => {
    await insertHeartRateSamples({
      heartRateSessionId: cached.id,
      userId: cached.userId,
      trainingSessionId: cached.trainingSessionId,
      samples: batch,
    });
  });
  cached = { ...cached, queue, lastFlushAtMs: Date.now() };
  persist();
  if (cached.startedAt) {
    await upsertHeartRateSession({
      id: cached.id,
      userId: cached.userId,
      trainingSessionId: cached.trainingSessionId,
      wearableDeviceId: cached.wearableDeviceId,
      startedAt: cached.startedAt,
      endedAt: cached.endedAt,
      stats: cached.stats,
    });
  }
}

export function pendingLocalSyncCount(): number {
  hydrate();
  return pendingHeartRateCount(cached.queue);
}
