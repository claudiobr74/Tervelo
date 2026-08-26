"use client";

import { useSyncExternalStore } from "react";
import { recordBodyMeasurement } from "@/application/use-cases/record-measurement";
import { recordRecoveryCheckin } from "@/application/use-cases/record-recovery-checkin";
import type {
  MeasurementRecord,
  MeasurementRepository,
  RecoveryCheckinRecord,
  RecoveryCheckinRepository,
} from "@/application/ports";
import type { RecoveryScores } from "@/domain/recovery/trend";
import { PREVIEW_TRAINING_USER_ID } from "@/lib/training/preview-workout";

export const LONGITUDINAL_KEY = "tervelo-longitudinal";

export type LongitudinalState = {
  checkins: RecoveryCheckinRecord[];
  measurements: MeasurementRecord[];
};

const listeners = new Set<() => void>();
let cached: LongitudinalState = { checkins: [], measurements: [] };
let hydrated = false;

function emit() {
  for (const listener of listeners) listener();
}

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString();
}

function seedCheckin(
  id: string,
  daysAgo: number,
  scores: RecoveryScores,
): RecoveryCheckinRecord {
  return {
    id,
    userId: PREVIEW_TRAINING_USER_ID,
    checkedInAt: daysAgoIso(daysAgo),
    ...scores,
  };
}

function seedMeasurement(
  id: string,
  daysAgo: number,
  values: Omit<MeasurementRecord, "id" | "userId" | "measuredAt" | "source">,
): MeasurementRecord {
  return {
    id,
    userId: PREVIEW_TRAINING_USER_ID,
    measuredAt: daysAgoIso(daysAgo),
    source: "user",
    ...values,
  };
}

const DEFAULT_SCORES: RecoveryScores = {
  sleepQuality: 4,
  energy: 4,
  mood: 4,
  muscleSoreness: 2,
  discomfort: 2,
  stress: 2,
  perceivedRecovery: 4,
};

function seedState(): LongitudinalState {
  return {
    checkins: [
      seedCheckin("seed-r1", 6, { ...DEFAULT_SCORES, energy: 3, perceivedRecovery: 3 }),
      seedCheckin("seed-r2", 4, DEFAULT_SCORES),
      seedCheckin("seed-r3", 2, { ...DEFAULT_SCORES, energy: 5, perceivedRecovery: 4 }),
    ],
    measurements: [
      seedMeasurement("seed-m365", 360, {
        weightKg: 80,
        bodyFatPercent: 18,
        waistCm: 88,
        rightArmCm: 36.5,
        rightThighCm: 58,
      }),
      seedMeasurement("seed-m180", 170, {
        weightKg: 80.8,
        bodyFatPercent: 17.4,
        waistCm: 87,
        rightArmCm: 37,
        rightThighCm: 59,
      }),
      seedMeasurement("seed-m90", 85, {
        weightKg: 81.4,
        bodyFatPercent: 16.9,
        waistCm: 86,
        rightArmCm: 37.4,
        rightThighCm: 59.5,
      }),
      seedMeasurement("seed-m30", 29, {
        weightKg: 82.1,
        bodyFatPercent: 16.6,
        waistCm: 85,
        rightArmCm: 38,
        rightThighCm: 60.2,
      }),
      seedMeasurement("seed-m6", 6, { weightKg: 82.0, bodyFatPercent: 16.4 }),
      seedMeasurement("seed-m5", 5, { weightKg: 81.9, bodyFatPercent: 16.4 }),
      seedMeasurement("seed-m4", 4, { weightKg: 82.1, bodyFatPercent: 16.3 }),
      seedMeasurement("seed-m3", 3, { weightKg: 82.0, bodyFatPercent: 16.3 }),
      seedMeasurement("seed-m2", 2, { weightKg: 82.2, bodyFatPercent: 16.3 }),
      seedMeasurement("seed-m1", 1, { weightKg: 82.1, bodyFatPercent: 16.2 }),
      seedMeasurement("seed-m0", 0, {
        weightKg: 82.4,
        bodyFatPercent: 16.2,
        waistCm: 84,
        rightArmCm: 38.5,
        rightThighCm: 61,
      }),
    ],
  };
}

function persist(next: LongitudinalState) {
  cached = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(LONGITUDINAL_KEY, JSON.stringify(next));
  }
  emit();
}

function readStored(): LongitudinalState {
  if (typeof window === "undefined") return seedState();
  try {
    const raw = window.localStorage.getItem(LONGITUDINAL_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw) as Partial<LongitudinalState>;
    const checkins = Array.isArray(parsed.checkins) ? parsed.checkins : [];
    const measurements = Array.isArray(parsed.measurements) ? parsed.measurements : [];
    if (checkins.length === 0 && measurements.length === 0) return seedState();
    return { checkins, measurements };
  } catch {
    return seedState();
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  cached = readStored();
  if (!window.localStorage.getItem(LONGITUDINAL_KEY)) {
    window.localStorage.setItem(LONGITUDINAL_KEY, JSON.stringify(cached));
  }
}

const SERVER_SEED: LongitudinalState = seedState();

export function getLongitudinal(): LongitudinalState {
  hydrate();
  return cached;
}

export function getServerLongitudinal(): LongitudinalState {
  return SERVER_SEED;
}

export function subscribeLongitudinal(listener: () => void): () => void {
  hydrate();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const measurementRepo: MeasurementRepository = {
  async insert(row) {
    hydrate();
    const created: MeasurementRecord = { ...row, id: crypto.randomUUID() };
    persist({ ...cached, measurements: [...cached.measurements, created] });
    return created;
  },
};

const recoveryRepo: RecoveryCheckinRepository = {
  async insert(row) {
    hydrate();
    const created: RecoveryCheckinRecord = { ...row, id: crypto.randomUUID() };
    persist({ ...cached, checkins: [...cached.checkins, created] });
    return created;
  },
};

export async function appendRecoveryCheckin(scores: RecoveryScores) {
  return recordRecoveryCheckin(recoveryRepo, {
    userId: PREVIEW_TRAINING_USER_ID,
    ...scores,
  });
}

export async function appendBodyMeasurement(
  input: Omit<MeasurementRecord, "id" | "userId" | "measuredAt" | "source">,
) {
  return recordBodyMeasurement(measurementRepo, {
    userId: PREVIEW_TRAINING_USER_ID,
    ...input,
  });
}

export function useLongitudinal(): LongitudinalState {
  return useSyncExternalStore(subscribeLongitudinal, getLongitudinal, getServerLongitudinal);
}
