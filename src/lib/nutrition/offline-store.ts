"use client";

import { useSyncExternalStore } from "react";
import { recordNutritionCheckin } from "@/application/use-cases/record-nutrition-checkin";
import type { NutritionCheckinRecord, NutritionCheckinRepository } from "@/application/ports";
import { KV_KEYS, scheduleKvWrite } from "@/lib/offline/idb";
import { enqueueSync } from "@/lib/offline/queue-store";
import { currentOfflineUserId } from "@/lib/offline/user-scope";
import { PREVIEW_NUTRITION_INTAKE } from "@/lib/nutrition/preview";
import { PREVIEW_TRAINING_USER_ID } from "@/lib/training/preview-workout";

export type NutritionOfflineState = {
  extraFluidMl: number;
  adheredMeals: string[];
  checkins: NutritionCheckinRecord[];
};

const EMPTY: NutritionOfflineState = {
  extraFluidMl: 0,
  adheredMeals: [],
  checkins: [],
};

const listeners = new Set<() => void>();
let cached: NutritionOfflineState = EMPTY;
let hydrated = false;
let mutatedSinceBoot = false;

function emit() {
  for (const listener of listeners) listener();
}

function persist(next: NutritionOfflineState) {
  cached = next;
  mutatedSinceBoot = true;
  if (typeof window !== "undefined") {
    scheduleKvWrite(currentOfflineUserId(), KV_KEYS.nutrition, next);
  }
  emit();
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
}

export function hydrateNutritionFromDurable(state: NutritionOfflineState) {
  if (mutatedSinceBoot) return;
  cached = {
    extraFluidMl: state.extraFluidMl ?? 0,
    adheredMeals: Array.isArray(state.adheredMeals) ? state.adheredMeals : [],
    checkins: Array.isArray(state.checkins) ? state.checkins : [],
  };
  hydrated = true;
  emit();
}

export function getNutritionOffline(): NutritionOfflineState {
  hydrate();
  return cached;
}

export function subscribeNutritionOffline(listener: () => void): () => void {
  hydrate();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useNutritionOffline(): NutritionOfflineState {
  return useSyncExternalStore(subscribeNutritionOffline, getNutritionOffline, () => EMPTY);
}

const repo: NutritionCheckinRepository = {
  async insert(row) {
    hydrate();
    const created: NutritionCheckinRecord = { ...row, id: crypto.randomUUID() };
    persist({ ...cached, checkins: [...cached.checkins, created] });
    enqueueSync({
      id: created.id,
      tipo: "NUTRITION_CHECKIN_RECORDED",
      entidade: "nutrition_checkin",
      entity_id: created.id,
      client_mutation_id: created.id,
      occurred_at: new Date().toISOString(),
      user_id: PREVIEW_TRAINING_USER_ID,
      payload: { ...created },
    });
    return created;
  },
};

export async function addHydration(ml: number) {
  hydrate();
  const next = cached.extraFluidMl + ml;
  persist({ ...cached, extraFluidMl: next });
  const id = crypto.randomUUID();
  enqueueSync({
    id,
    tipo: "NUTRITION_HYDRATION_RECORDED",
    entidade: "nutrition_hydration",
    entity_id: id,
    client_mutation_id: id,
    occurred_at: new Date().toISOString(),
    user_id: PREVIEW_TRAINING_USER_ID,
    payload: { fluidMl: ml, totalExtraMl: next },
  });
}

export function toggleMealAdherence(mealName: string) {
  hydrate();
  const has = cached.adheredMeals.includes(mealName);
  const adheredMeals = has
    ? cached.adheredMeals.filter((name) => name !== mealName)
    : [...cached.adheredMeals, mealName];
  persist({ ...cached, adheredMeals });
  const id = crypto.randomUUID();
  enqueueSync({
    id,
    tipo: "NUTRITION_MEAL_ADHERENCE",
    entidade: "nutrition_meal",
    entity_id: id,
    client_mutation_id: id,
    occurred_at: new Date().toISOString(),
    user_id: PREVIEW_TRAINING_USER_ID,
    payload: { mealName, adhered: !has },
  });
}

export async function saveNutritionCheckinToday() {
  const today = new Date().toISOString().slice(0, 10);
  return recordNutritionCheckin(repo, {
    userId: PREVIEW_TRAINING_USER_ID,
    checkedInOn: today,
    todayIso: today,
    energyKcal: PREVIEW_NUTRITION_INTAKE.energyKcal,
    proteinG: PREVIEW_NUTRITION_INTAKE.proteinG,
    carbohydrateG: PREVIEW_NUTRITION_INTAKE.carbohydrateG,
    fatG: PREVIEW_NUTRITION_INTAKE.fatG,
    fluidMl: PREVIEW_NUTRITION_INTAKE.fluidMl + cached.extraFluidMl,
  });
}
