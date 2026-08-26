import { UNKNOWN, type UnknownOr } from "../ai/nutrition-context";
import { median, qualityLabel, recoveryTrend, sessionStats } from "./metrics";
import type {
  HeartRateQualityLabel,
  HeartRateRecoveryTrend,
  HeartRateSample,
  SetHeartRateMetrics,
} from "./types";

export type HeartRateContext = {
  enabled: boolean;
  session: {
    averageBpm: UnknownOr<number>;
    maximumBpm: UnknownOr<number>;
    minimumBpm: UnknownOr<number>;
    coverage: UnknownOr<number>;
    sampleCount: UnknownOr<number>;
  };
  recovery: {
    median60Seconds: UnknownOr<number>;
    trend: UnknownOr<HeartRateRecoveryTrend>;
  };
  comparability: {
    sameDevice: UnknownOr<boolean>;
    comparableSessions: UnknownOr<number>;
  };
  quality: UnknownOr<HeartRateQualityLabel>;
};

export const HEART_RATE_ANALYSIS_RULE = [
  "A frequência cardíaca é informação complementar.",
  "Nunca utilizar isoladamente para determinar intensidade muscular, proximidade da falha, aumentar ou reduzir carga ou volume, indicar deload, avaliar hipertrofia, diagnosticar fadiga ou diagnosticar doença.",
  "Sempre contextualizar com desempenho, carga, repetições, séries, proximidade da falha, percepção de esforço, recuperação e nutrição.",
  "Priorizar comparação intraindividual: mesmo usuário, sessões semelhantes, mesmo exercício quando aplicável, descansos semelhantes e preferencialmente o mesmo dispositivo.",
  "Troca de dispositivo reduz comparabilidade (sameDevice = false).",
  "Baixa cobertura reduz confiança. Uma única leitura não justifica decisão.",
].join(" ");

export const HEART_RATE_SIGNAL_PRIORITY = [
  "performance",
  "carga",
  "repetições",
  "séries",
  "proximidade da falha",
  "percepção de esforço",
  "recuperação",
  "frequência cardíaca",
  "outros sinais complementares",
] as const;

export function emptyHeartRateContext(): HeartRateContext {
  return {
    enabled: false,
    session: {
      averageBpm: UNKNOWN,
      maximumBpm: UNKNOWN,
      minimumBpm: UNKNOWN,
      coverage: UNKNOWN,
      sampleCount: UNKNOWN,
    },
    recovery: { median60Seconds: UNKNOWN, trend: UNKNOWN },
    comparability: { sameDevice: UNKNOWN, comparableSessions: UNKNOWN },
    quality: UNKNOWN,
  };
}

export function buildHeartRateContext(input: {
  heartRateEnabled: boolean;
  samples: HeartRateSample[];
  startedAt: string | null;
  endedAt: string | null;
  setMetrics: SetHeartRateMetrics[];
  sameDevice: boolean | null;
  comparableSessions: number | null;
  previousRecoveryMedians?: Array<number | null>;
}): HeartRateContext | null {
  if (!input.heartRateEnabled) return null;

  const stats = sessionStats(input.samples, input.startedAt, input.endedAt);
  const quality = qualityLabel(stats);
  if (quality === "INSUFFICIENT") return null;

  const recoveries = input.setMetrics
    .map((row) => row.recovery60Seconds)
    .filter((value): value is number => value !== null);
  const median60 = median(recoveries);
  const trend = recoveryTrend([...(input.previousRecoveryMedians ?? []), median60]);

  return {
    enabled: true,
    session: {
      averageBpm: stats.averageBpm,
      maximumBpm: stats.maximumBpm,
      minimumBpm: stats.minimumBpm,
      coverage: stats.sensorCoverage,
      sampleCount: stats.sampleCount,
    },
    recovery: {
      median60Seconds: median60,
      trend,
    },
    comparability: {
      sameDevice: input.sameDevice,
      comparableSessions: input.comparableSessions,
    },
    quality,
  };
}
