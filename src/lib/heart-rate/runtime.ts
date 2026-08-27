"use client";

import { useSyncExternalStore } from "react";
import { sampleValidity } from "@/domain/heart-rate/parse-measurement";
import { sessionStats } from "@/domain/heart-rate/metrics";
import type { HeartRateStatus } from "@/domain/heart-rate/types";
import { currentExercise, currentSet, isSessionComplete } from "@/domain/training/session";
import {
  getHeartRateEnabled,
  setHeartRateEnabled,
  subscribeHeartRateEnabled,
} from "./preference-store";
import {
  appendHeartRateSample,
  beginHeartRateCapture,
  deactivateWearable,
  flushStoredHeartRate,
  getHeartRateSession,
  getWearableDevice,
  markHeartRateSessionEnded,
  pendingLocalSyncCount,
  rememberWearable,
  samplesFromQueue,
  setLastExerciseId,
  subscribeHeartRateSession,
} from "./session-store";
import { isWebBluetoothSupported } from "./bluetooth";
import { WebBluetoothHeartRateProvider } from "./web-bluetooth-provider";
import { getLiveSession, subscribeLiveSession } from "@/lib/training/live-session";
import { PREVIEW_WORKOUT } from "@/lib/training/preview-workout";
import { currentOfflineUserId } from "@/lib/offline/user-scope";

export type HeartRateRuntimeState = {
  status: HeartRateStatus;
  enabled: boolean;
  bpm: number | null;
  deviceName: string | null;
  errorMessage: string | null;
  lastConnectedAt: string | null;
  online: boolean;
  pendingSync: number;
  justConnected: boolean;
};

const INITIAL: HeartRateRuntimeState = {
  status: "DISABLED",
  enabled: false,
  bpm: null,
  deviceName: null,
  errorMessage: null,
  lastConnectedAt: null,
  online: true,
  pendingSync: 0,
  justConnected: false,
};

const listeners = new Set<() => void>();
let state: HeartRateRuntimeState = INITIAL;
let provider: WebBluetoothHeartRateProvider | null = null;
let started = false;
let lastLiveStatus: string | null = null;
let lastExerciseId: string | null = null;
let capturingSessionId: string | null = null;

function emit() {
  for (const listener of listeners) listener();
}

function setState(patch: Partial<HeartRateRuntimeState>) {
  state = { ...state, ...patch };
  emit();
}

function deriveStatus(
  enabled: boolean,
  supported: boolean,
  current: HeartRateStatus,
): HeartRateStatus {
  if (!enabled) return "DISABLED";
  if (!supported) return "UNSUPPORTED";
  if (current === "DISABLED" || current === "UNSUPPORTED") {
    return "READY";
  }
  return current;
}

function ensureProvider(): WebBluetoothHeartRateProvider {
  if (!provider) {
    provider = new WebBluetoothHeartRateProvider();
    provider.subscribeConnection((event) => {
      setState({
        status: event.status,
        deviceName: event.displayName,
        errorMessage: event.errorMessage,
        lastConnectedAt:
          event.status === "CONNECTED" || event.status === "STREAMING"
            ? new Date().toISOString()
            : state.lastConnectedAt,
        justConnected: event.status === "STREAMING" || event.status === "CONNECTED",
        bpm: event.status === "DISCONNECTED" || event.status === "ERROR" ? null : state.bpm,
      });
      if (event.displayName && (event.status === "CONNECTED" || event.status === "STREAMING")) {
        rememberWearable(event.displayName);
      }
    });
    provider.subscribeSamples(({ recordedAt, measurement }) => {
      if (!getHeartRateEnabled()) return;
      const live = getLiveSession();
      const capturing = live.status === "active" || live.status === "resting";
      const validity = sampleValidity(measurement.bpm, measurement.sensorContactDetected);
      setState({
        bpm: measurement.bpm,
        status: "STREAMING",
        justConnected: false,
      });
      if (!capturing || !capturingSessionId) return;
      const exercise = isSessionComplete(PREVIEW_WORKOUT, live.recorded)
        ? null
        : currentExercise(PREVIEW_WORKOUT, live.recorded);
      const set = isSessionComplete(PREVIEW_WORKOUT, live.recorded)
        ? null
        : currentSet(PREVIEW_WORKOUT, live.recorded);
      appendHeartRateSample({
        id: crypto.randomUUID(),
        recordedAt: recordedAt.toISOString(),
        bpm: measurement.bpm,
        source: "web_bluetooth",
        isValid: validity.isValid,
        quality: validity.quality,
        qualityReason: validity.qualityReason,
        exerciseId: exercise?.id ?? null,
        setId: set?.id ?? null,
      });
    });
  }
  return provider;
}

function syncFromPreference() {
  const enabled = getHeartRateEnabled();
  const supported = isWebBluetoothSupported();
  const wearable = getWearableDevice();
  if (!enabled) {
    if (provider) void provider.disconnect();
    capturingSessionId = null;
    setState({
      enabled: false,
      status: "DISABLED",
      bpm: null,
      errorMessage: null,
      justConnected: false,
      pendingSync: pendingLocalSyncCount(),
      deviceName: wearable?.displayName ?? state.deviceName,
      lastConnectedAt: wearable?.lastConnectedAt ?? state.lastConnectedAt,
    });
    return;
  }
  setState({
    enabled: true,
    status: deriveStatus(true, supported, state.status === "DISABLED" ? "READY" : state.status),
    errorMessage: supported
      ? null
      : "Este navegador não oferece conexão direta com frequencímetros Bluetooth.",
    deviceName: wearable?.displayName ?? state.deviceName,
    lastConnectedAt: wearable?.lastConnectedAt ?? state.lastConnectedAt,
    pendingSync: pendingLocalSyncCount(),
  });
}

function onLiveChange() {
  if (!getHeartRateEnabled()) return;
  const live = getLiveSession();
  const exercise =
    live.status === "idle" ||
    live.status === "completed" ||
    isSessionComplete(PREVIEW_WORKOUT, live.recorded)
      ? null
      : currentExercise(PREVIEW_WORKOUT, live.recorded);

  if (live.status === "active" && live.startedAt && capturingSessionId !== live.startedAt) {
    capturingSessionId = live.startedAt;
    beginHeartRateCapture({
      userId: currentOfflineUserId(),
      trainingSessionId: PREVIEW_WORKOUT.id,
      startedAt: live.startedAt,
    });
  }

  if (exercise && lastExerciseId && exercise.id !== lastExerciseId) {
    void flushStoredHeartRate("exercise_change");
  }
  if (exercise) {
    lastExerciseId = exercise.id;
    setLastExerciseId(exercise.id);
  }

  if (live.status === "completed" && lastLiveStatus !== "completed") {
    const stored = getHeartRateSession();
    const stats = sessionStats(samplesFromQueue(), stored.startedAt, live.completedAt);
    markHeartRateSessionEnded(live.completedAt ?? new Date().toISOString(), stats);
    void flushStoredHeartRate("session_end");
    capturingSessionId = null;
  }
  lastLiveStatus = live.status;
  setState({ pendingSync: pendingLocalSyncCount() });
}

function onOnline() {
  setState({ online: typeof navigator === "undefined" ? true : navigator.onLine });
  if (typeof navigator !== "undefined" && navigator.onLine) {
    void flushStoredHeartRate("online");
  }
}

function boot() {
  if (started || typeof window === "undefined") return;
  started = true;
  ensureProvider();
  syncFromPreference();
  subscribeHeartRateEnabled(() => syncFromPreference());
  subscribeLiveSession(() => onLiveChange());
  subscribeHeartRateSession(() => setState({ pendingSync: pendingLocalSyncCount() }));
  window.addEventListener("online", onOnline);
  window.addEventListener("offline", onOnline);
  setState({ online: navigator.onLine });
  window.setInterval(() => {
    void flushStoredHeartRate("interval");
  }, 15_000);
}

export function subscribeHeartRateRuntime(listener: () => void): () => void {
  boot();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getHeartRateRuntime(): HeartRateRuntimeState {
  boot();
  return state;
}

export function getServerHeartRateRuntime(): HeartRateRuntimeState {
  return INITIAL;
}

export function useHeartRateRuntime(): HeartRateRuntimeState {
  return useSyncExternalStore(
    subscribeHeartRateRuntime,
    getHeartRateRuntime,
    getServerHeartRateRuntime,
  );
}

export async function enableHeartRate(enabled: boolean) {
  setHeartRateEnabled(enabled);
  if (!enabled) {
    deactivateWearable();
    await ensureProvider().disconnect();
  }
}

export async function connectHeartRateMonitor() {
  const enabled = getHeartRateEnabled();
  if (!enabled) return;
  if (!isWebBluetoothSupported()) {
    setState({
      status: "UNSUPPORTED",
      errorMessage: "Este navegador não oferece conexão direta com frequencímetros Bluetooth.",
    });
    return;
  }
  try {
    await ensureProvider().requestAndConnect();
  } catch (error) {
    if (error instanceof Error && error.message === "WEB_BLUETOOTH_UNSUPPORTED") {
      setState({
        status: "UNSUPPORTED",
        errorMessage: "Este navegador não oferece conexão direta com frequencímetros Bluetooth.",
      });
      return;
    }
    setState({
      status: getHeartRateEnabled() ? "READY" : "DISABLED",
      errorMessage: null,
    });
  }
}

export async function disconnectHeartRateMonitor() {
  deactivateWearable();
  await ensureProvider().disconnect();
}

export async function reconnectHeartRateMonitor() {
  try {
    await ensureProvider().reconnectWithUserGesture();
  } catch {
    setState({ status: "DISCONNECTED" });
  }
}

export function clearHeartRateConnectedBanner() {
  setState({ justConnected: false });
}

export function currentHeartRateDetails() {
  const stored = getHeartRateSession();
  const samples = samplesFromQueue();
  const live = getLiveSession();
  const ended = live.completedAt ?? stored.endedAt ?? new Date().toISOString();
  const stats = sessionStats(samples, stored.startedAt ?? live.startedAt, ended);
  return { stored, samples, stats, wearable: getWearableDevice() };
}
