"use client";

import { useSyncExternalStore } from "react";
import { parseHeartRateEnabled } from "@/domain/heart-rate/preference";
import { DEFAULT_HEART_RATE_ENABLED, HEART_RATE_PREFERENCE_KEY } from "@/domain/heart-rate/types";

export const HEART_RATE_PREF_KEY = "tervelo-heart-rate-enabled";

const listeners = new Set<() => void>();
let cached = DEFAULT_HEART_RATE_ENABLED;
let hydrated = false;

function emit() {
  for (const listener of listeners) listener();
}

function persist(next: boolean) {
  cached = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(HEART_RATE_PREF_KEY, next ? "true" : "false");
  }
  emit();
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  cached = parseHeartRateEnabled(window.localStorage.getItem(HEART_RATE_PREF_KEY));
}

export function getHeartRateEnabled(): boolean {
  hydrate();
  return cached;
}

export function getServerHeartRateEnabled(): boolean {
  return DEFAULT_HEART_RATE_ENABLED;
}

export function subscribeHeartRateEnabled(listener: () => void): () => void {
  hydrate();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setHeartRateEnabled(enabled: boolean) {
  hydrate();
  persist(enabled);
}

export function useHeartRateEnabled(): boolean {
  return useSyncExternalStore(
    subscribeHeartRateEnabled,
    getHeartRateEnabled,
    getServerHeartRateEnabled,
  );
}

export { HEART_RATE_PREFERENCE_KEY };
