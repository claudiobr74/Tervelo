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

const EMPTY_STATE: LongitudinalState = { checkins: [], measurements: [] };

function initialState(): LongitudinalState {
  return EMPTY_STATE;
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
