export const HEART_RATE_STATUSES = [
  "DISABLED",
  "UNSUPPORTED",
  "READY",
  "REQUESTING_DEVICE",
  "CONNECTING",
  "CONNECTED",
  "STREAMING",
  "DISCONNECTED",
  "RECONNECTING",
  "ERROR",
] as const;

export type HeartRateStatus = (typeof HEART_RATE_STATUSES)[number];

export const WORKOUT_TIMELINE_EVENT_TYPES = [
  "SESSION_STARTED",
  "EXERCISE_STARTED",
  "SET_STARTED",
  "SET_COMPLETED",
  "REST_STARTED",
  "REST_COMPLETED",
  "EXERCISE_COMPLETED",
  "SESSION_COMPLETED",
] as const;

export type WorkoutTimelineEventType = (typeof WORKOUT_TIMELINE_EVENT_TYPES)[number];

export type WorkoutTimelineEvent = {
  type: WorkoutTimelineEventType;
  at: string;
  setId?: string;
  exerciseId?: string;
};

export type HeartRateMeasurement = {
  bpm: number;
  sensorContactDetected: boolean | null;
  rrIntervals: number[];
  energyExpended: number | null;
  rawFlags: number;
};

export type HeartRateSample = {
  id: string;
  recordedAt: string;
  bpm: number;
  source: "web_bluetooth";
  isValid: boolean;
  quality: HeartRateSampleQuality;
  qualityReason: string | null;
  exerciseId: string | null;
  setId: string | null;
};

export type HeartRateSampleQuality = "good" | "degraded" | "poor";

export type HeartRateSessionStats = {
  averageBpm: number | null;
  maximumBpm: number | null;
  minimumBpm: number | null;
  sampleCount: number;
  sensorCoverage: number | null;
};

export type SetHeartRateMetrics = {
  setId: string;
  exerciseId: string | null;
  heartRateBeforeSet: number | null;
  heartRatePeak: number | null;
  heartRateAtSetEnd: number | null;
  heartRateAfter30Seconds: number | null;
  heartRateAfter60Seconds: number | null;
  heartRateAfter90Seconds: number | null;
  heartRateAfter120Seconds: number | null;
  recovery60Seconds: number | null;
};

export type HeartRateRecoveryTrend = "STABLE" | "SLOWER" | "FASTER" | "UNKNOWN";

export type HeartRateQualityLabel = "GOOD" | "DEGRADED" | "POOR" | "INSUFFICIENT";

export const HEART_RATE_PROCESSING_VERSION = "hr-v1";

export const DEFAULT_HEART_RATE_ENABLED = false;

export const HEART_RATE_PREFERENCE_KEY = "heart_rate_enabled";
