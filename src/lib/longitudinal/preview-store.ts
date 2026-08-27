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
import { KV_KEYS, scheduleKvWrite } from "@/lib/offline/idb";
import { enqueueSync } from "@/lib/offline/queue-store";
import { currentOfflineUserId } from "@/lib/offline/user-scope";
import { demoDataEnabled } from "@/lib/demo-data";

export const LONGITUDINAL_KEY = "tervelo-longitudinal";

export type LongitudinalState = {
  checkins: RecoveryCheckinRecord[];
  measurements: MeasurementRecord[];
};

const listeners = new Set<() => void>();
let cached: LongitudinalState = { checkins: [], measurements: [] };
let hydrated = false;
let mutatedSinceBoot = false;

function emit() {
  for (const listener of listeners) listener();
}

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000 - 1000).toISOString();
}

function seedCheckin(id: string, daysAgo: number, scores: RecoveryScores): RecoveryCheckinRecord {
  return {
    id,
    userId: currentOfflineUserId(),
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
    userId: currentOfflineUserId(),
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

const EMPTY_STATE: LongitudinalState = { checkins: [], measurements: [] };

/**
 * Histórico de demonstração. Com backend real o atleta começa vazio: mostrar
 * doze meses de evolução que ele nunca teve seria inventar dados.
 */
function initialState(): LongitudinalState {
  return demoDataEnabled() ? seedState() : EMPTY_STATE;
}

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
  mutatedSinceBoot = true;
  if (typeof window !== "undefined") {
    scheduleKvWrite(currentOfflineUserId(), KV_KEYS.longitudinal, next);
  }
  emit();
}

function readStored(): LongitudinalState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(LONGITUDINAL_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as Partial<LongitudinalState>;
    const checkins = Array.isArray(parsed.checkins) ? parsed.checkins : [];
    const measurements = Array.isArray(parsed.measurements) ? parsed.measurements : [];
    if (checkins.length === 0 && measurements.length === 0) return initialState();
    return { checkins, measurements };
  } catch {
    return initialState();
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  cached = readStored();
}

export function hydrateLongitudinalFromDurable(state: LongitudinalState) {
  if (mutatedSinceBoot) return;
  const checkins = Array.isArray(state.checkins) ? state.checkins : [];
  const measurements = Array.isArray(state.measurements) ? state.measurements : [];
  cached =
    checkins.length === 0 && measurements.length === 0
      ? initialState()
      : { checkins, measurements };
  hydrated = true;
  emit();
}

const SERVER_SEED: LongitudinalState = EMPTY_STATE;

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
    enqueueSync({
      id: created.id,
      tipo: "BODY_WEIGHT_RECORDED",
      entidade: "body_measurement",
      entity_id: created.id,
      client_mutation_id: created.id,
      occurred_at: created.measuredAt,
      user_id: currentOfflineUserId(),
      payload: {
        weightKg: created.weightKg,
        bodyFatPercent: created.bodyFatPercent,
        waistCm: created.waistCm,
        rightArmCm: created.rightArmCm,
        rightThighCm: created.rightThighCm,
        source: created.source,
      },
    });
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
    userId: currentOfflineUserId(),
    ...scores,
  });
}

export async function appendBodyMeasurement(
  input: Omit<MeasurementRecord, "id" | "userId" | "measuredAt" | "source">,
) {
  return recordBodyMeasurement(measurementRepo, {
    userId: currentOfflineUserId(),
    ...input,
  });
}

export function useLongitudinal(): LongitudinalState {
  return useSyncExternalStore(subscribeLongitudinal, getLongitudinal, getServerLongitudinal);
}
