import { MIN_POINTS_FOR_TREND } from "../recovery/trend";
import type { DataQualityLevel } from "./types";

export type DataQualityInput = {
  sessionCount: number;
  comparableSessions: number;
  sameExercise: boolean;
  sameEquipment: boolean;
  gymChanged: boolean;
  missingFields: number;
  recordAdherence: number | null;
  anthropometryMethodChanged: boolean;
  weighInCount: number;
  heartRateEnabled: boolean;
  heartRateCoverage: number | null;
  heartRateDeviceChanged: boolean;
  nutritionCoverage: number | null;
  checkinCoverage: number | null;
};

export type DataQualityResult = {
  nivel: DataQualityLevel;
  motivos: string[];
};

export function assessDataQuality(input: DataQualityInput): DataQualityResult {
  const motivos: string[] = [];
  let score = 0;

  if (input.sessionCount >= 8) score += 2;
  else if (input.sessionCount >= MIN_POINTS_FOR_TREND) score += 1;
  else motivos.push("Poucas sessões registradas.");

  if (
    input.comparableSessions >= MIN_POINTS_FOR_TREND &&
    input.sameExercise &&
    input.sameEquipment
  ) {
    score += 2;
  } else if (input.comparableSessions >= 1) {
    score += 1;
    motivos.push("Comparabilidade limitada entre sessões.");
  } else {
    motivos.push("Sessões pouco comparáveis.");
  }

  if (input.gymChanged) {
    score -= 1;
    motivos.push("Mudança de academia reduz comparabilidade.");
  }
  if (!input.sameEquipment) {
    score -= 1;
    motivos.push("Equipamento diferente entre sessões.");
  }
  if (input.anthropometryMethodChanged) {
    score -= 1;
    motivos.push("Mudança de método antropométrico.");
  }
  if (input.heartRateEnabled && input.heartRateDeviceChanged) {
    score -= 1;
    motivos.push("Troca de frequencímetro.");
  }

  if (input.missingFields >= 4) {
    score -= 2;
    motivos.push("Vários dados ausentes.");
  } else if (input.missingFields >= 1) {
    score -= 1;
    motivos.push("Há dados ausentes.");
  }

  if (input.recordAdherence != null && input.recordAdherence >= 0.8) score += 1;
  else if (input.recordAdherence != null && input.recordAdherence < 0.5) {
    score -= 1;
    motivos.push("Baixa aderência dos registros.");
  }

  if (input.weighInCount >= MIN_POINTS_FOR_TREND) score += 1;
  if (input.nutritionCoverage != null && input.nutritionCoverage >= 0.6) score += 1;
  if (input.checkinCoverage != null && input.checkinCoverage >= 0.6) score += 1;

  if (input.heartRateEnabled) {
    if (input.heartRateCoverage != null && input.heartRateCoverage >= 0.7) score += 1;
    else motivos.push("Cobertura do frequencímetro limitada.");
  }

  if (input.sessionCount < 2) {
    return {
      nivel: "INSUFICIENTE",
      motivos: motivos.length ? motivos : ["Histórico insuficiente."],
    };
  }
  if (score >= 7) return { nivel: "ALTA", motivos };
  if (score >= 4) return { nivel: "MODERADA", motivos };
  if (score >= 1) return { nivel: "BAIXA", motivos };
  return { nivel: "INSUFICIENTE", motivos };
}

export function confidenceFromQuality(
  quality: DataQualityLevel,
  extras: { checkinMissing?: boolean; fewSessions?: boolean } = {},
): DataQualityLevel {
  let level: DataQualityLevel = quality;
  if (extras.checkinMissing) {
    if (level === "ALTA") level = "MODERADA";
    else if (level === "MODERADA") level = "BAIXA";
  }
  if (extras.fewSessions && (level === "ALTA" || level === "MODERADA")) level = "BAIXA";
  return level;
}
