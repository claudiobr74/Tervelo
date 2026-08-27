"use client";

import { emptyNutritionContext, type NutritionContext } from "@/domain/ai/nutrition-context";
import { emptyCoachFacts, type CoachKnownFacts } from "@/domain/ai/coach-preview";
import { buildHeartRateContext } from "@/domain/heart-rate/context";
import { metricsForSet, setWindowsFromTimeline } from "@/domain/heart-rate/metrics";
import { getAthleteStateStore } from "@/lib/athlete-state/session-store";
import { getHeartRateEnabled } from "@/lib/heart-rate/preference-store";
import { currentHeartRateDetails } from "@/lib/heart-rate/runtime";
import { getNutritionOffline } from "@/lib/nutrition/offline-store";
import { getLiveSession } from "@/lib/training/live-session";

function nutritionFromOffline(): NutritionContext {
  const nutrition = getNutritionOffline();
  const context = emptyNutritionContext();
  if (nutrition.extraFluidMl > 0) {
    context.hydration.estimatedIntakeMl = nutrition.extraFluidMl;
  }
  const last = nutrition.checkins.at(-1);
  if (last) {
    if (typeof last.energyKcal === "number") {
      context.energy.estimatedIntakeKcal = last.energyKcal;
    }
    if (typeof last.proteinG === "number") {
      context.protein.estimatedIntakeGrams = last.proteinG;
    }
    if (typeof last.carbohydrateG === "number") {
      context.carbohydrate.estimatedIntakeGrams = last.carbohydrateG;
    }
    if (typeof last.fatG === "number") {
      context.fat.estimatedIntakeGrams = last.fatG;
    }
    if (typeof last.fluidMl === "number") {
      context.hydration.estimatedIntakeMl = last.fluidMl;
    }
  }
  return context;
}

/** Monta o recorte do atleta neste aparelho. Sem prescrição nem carga, os fatos de força ficam UNKNOWN. */
export function liveCoachFacts(): CoachKnownFacts {
  const live = getLiveSession();
  const athlete = getAthleteStateStore();
  const details = currentHeartRateDetails();
  const heartRate = buildHeartRateContext({
    heartRateEnabled: getHeartRateEnabled(),
    samples: details.samples,
    startedAt: details.stored.startedAt ?? live.startedAt,
    endedAt: details.stored.endedAt ?? live.completedAt,
    setMetrics: setWindowsFromTimeline(live.events).map((window) =>
      metricsForSet(details.samples, window),
    ),
    sameDevice: true,
    comparableSessions: details.stats.sampleCount > 0 ? 1 : 0,
  });
  const adjustment = athlete.todayAdjustment;
  return {
    ...emptyCoachFacts,
    hasPrescribedSession: false,
    sessionChangedToday: Boolean(adjustment),
    sessionChangeReason: adjustment?.whyChanged ?? null,
    nutrition: nutritionFromOffline(),
    heartRate,
  };
}
