import type { PostWorkoutCheckout } from "./post-workout";
import type { PreWorkoutCheckin } from "./pre-workout";
import type { ChangeScope, DataQualityLevel } from "./types";

export type ObjectiveSessionFacts = {
  plannedSets: number;
  completedSets: number;
  plannedExercises: number;
  completedExercises: number;
  volumeKg: number | null;
  previousVolumeKg: number | null;
  loadProgressed: boolean;
  effortKnown: boolean;
};

export type SessionResponse = {
  checkin: PreWorkoutCheckin | null;
  checkout: PostWorkoutCheckout | null;
  objective: ObjectiveSessionFacts;
  heartRateUsed: boolean;
  dataQuality: DataQualityLevel;
  limitationPresent: boolean;
  adherence: "completa" | "parcial" | "nao_realizada";
  interpretationPriority: "objective_first";
  suggestedScope: ChangeScope;
};

export function buildSessionResponse(input: {
  checkin: PreWorkoutCheckin | null;
  checkout: PostWorkoutCheckout | null;
  objective: ObjectiveSessionFacts;
  heartRateEnabled: boolean;
  heartRateSamples: number;
  dataQuality: DataQualityLevel;
  limitationPresent: boolean;
  timeAdapted: boolean;
}): SessionResponse {
  const completedRatio =
    input.objective.plannedSets <= 0 ? 1 : input.objective.completedSets / input.objective.plannedSets;
  const adherence: SessionResponse["adherence"] =
    completedRatio >= 0.9 ? "completa" : completedRatio >= 0.4 ? "parcial" : "nao_realizada";

  let suggestedScope: ChangeScope = "SEM_MUDANCA";
  if (input.timeAdapted) suggestedScope = "AJUSTE_DA_SESSAO";
  if (input.limitationPresent) suggestedScope = "AJUSTE_DA_SESSAO";

  return {
    checkin: input.checkin,
    checkout: input.checkout,
    objective: input.objective,
    heartRateUsed: input.heartRateEnabled && input.heartRateSamples > 0,
    dataQuality: input.dataQuality,
    limitationPresent: input.limitationPresent,
    adherence,
    interpretationPriority: "objective_first",
    suggestedScope,
  };
}

export function objectiveOutranksPerception(response: SessionResponse): boolean {
  return response.interpretationPriority === "objective_first";
}
