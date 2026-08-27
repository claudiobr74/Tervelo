import type {
  HeartRateQualityLabel,
  HeartRateRecoveryTrend,
  HeartRateSample,
  HeartRateSessionStats,
  SetHeartRateMetrics,
  WorkoutTimelineEvent,
} from "./types";

const WINDOW_MS = 10_000;
const GAP_UNCOVERED_MS = 5_000;

function validSamples(samples: HeartRateSample[]): HeartRateSample[] {
  return samples.filter((sample) => sample.isValid && Number.isFinite(sample.bpm));
}

function atMs(iso: string): number {
  return new Date(iso).getTime();
}

function nearestInWindow(
  samples: HeartRateSample[],
  targetMs: number,
  windowMs = WINDOW_MS,
): number | null {
  let best: HeartRateSample | null = null;
  let bestDelta = Number.POSITIVE_INFINITY;
  for (const sample of samples) {
    const delta = Math.abs(atMs(sample.recordedAt) - targetMs);
    if (delta <= windowMs && delta < bestDelta) {
      best = sample;
      bestDelta = delta;
    }
  }
  return best ? best.bpm : null;
}

function lastBefore(
  samples: HeartRateSample[],
  targetMs: number,
  windowMs = WINDOW_MS,
): number | null {
  let best: HeartRateSample | null = null;
  for (const sample of samples) {
    const t = atMs(sample.recordedAt);
    if (t > targetMs) continue;
    if (targetMs - t > windowMs) continue;
    if (!best || t > atMs(best.recordedAt)) best = sample;
  }
  return best ? best.bpm : null;
}

function maxInRange(samples: HeartRateSample[], startMs: number, endMs: number): number | null {
  let peak: number | null = null;
  for (const sample of samples) {
    const t = atMs(sample.recordedAt);
    if (t < startMs || t > endMs) continue;
    peak = peak === null ? sample.bpm : Math.max(peak, sample.bpm);
  }
  return peak;
}

function afterOffset(
  samples: HeartRateSample[],
  originMs: number,
  offsetSeconds: number,
  windowMs = WINDOW_MS,
): number | null {
  const target = originMs + offsetSeconds * 1000;
  let best: HeartRateSample | null = null;
  let bestDelta = Number.POSITIVE_INFINITY;
  for (const sample of samples) {
    const t = atMs(sample.recordedAt);
    if (t < originMs) continue;
    const delta = Math.abs(t - target);
    if (delta <= windowMs && delta < bestDelta) {
      best = sample;
      bestDelta = delta;
    }
  }
  return best ? best.bpm : null;
}

export function sessionStats(
  samples: HeartRateSample[],
  startedAt: string | null,
  endedAt: string | null,
): HeartRateSessionStats {
  const valid = validSamples(samples);
  const sampleCount = valid.length;
  if (sampleCount === 0) {
    return {
      averageBpm: null,
      maximumBpm: null,
      minimumBpm: null,
      sampleCount: 0,
      sensorCoverage: startedAt && endedAt ? 0 : null,
    };
  }
  const bpms = valid.map((sample) => sample.bpm);
  const sum = bpms.reduce((acc, value) => acc + value, 0);
  return {
    averageBpm: Math.round(sum / sampleCount),
    maximumBpm: Math.max(...bpms),
    minimumBpm: Math.min(...bpms),
    sampleCount,
    sensorCoverage: sensorCoverage(valid, startedAt, endedAt),
  };
}

export function sensorCoverage(
  samples: HeartRateSample[],
  startedAt: string | null,
  endedAt: string | null,
): number | null {
  if (!startedAt || !endedAt) return null;
  const start = atMs(startedAt);
  const end = atMs(endedAt);
  const duration = end - start;
  if (duration <= 0) return null;
  const valid = validSamples(samples).sort(
    (a, b) => atMs(a.recordedAt) - atMs(b.recordedAt),
  );
  if (valid.length === 0) return 0;

  let covered = 0;
  let cursor = start;
  for (let index = 0; index < valid.length; index += 1) {
    const t = Math.min(end, Math.max(start, atMs(valid[index].recordedAt)));
    const prev = index === 0 ? start : Math.min(end, Math.max(start, atMs(valid[index - 1].recordedAt)));
    const gap = t - prev;
    if (index === 0) {
      if (t - start <= GAP_UNCOVERED_MS) covered += t - start;
    } else if (gap <= GAP_UNCOVERED_MS) {
      covered += gap;
    }
    cursor = t;
  }
  if (end - cursor <= GAP_UNCOVERED_MS) covered += Math.max(0, end - cursor);
  return Math.max(0, Math.min(1, Number((covered / duration).toFixed(4))));
}

export function recoveryDelta(peakBpm: number | null, laterBpm: number | null): number | null {
  if (peakBpm === null || laterBpm === null) return null;
  return peakBpm - laterBpm;
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  }
  return sorted[mid];
}

export function recoveryTrend(recentMedians: Array<number | null>): HeartRateRecoveryTrend {
  const values = recentMedians.filter((value): value is number => value !== null);
  if (values.length < 3) return "UNKNOWN";
  const latest = values[values.length - 1];
  const previous = values.slice(0, -1);
  const baseline = previous.reduce((acc, value) => acc + value, 0) / previous.length;
  const delta = latest - baseline;
  if (Math.abs(delta) < 4) return "STABLE";
  return delta < 0 ? "SLOWER" : "FASTER";
}

export function qualityLabel(stats: HeartRateSessionStats): HeartRateQualityLabel {
  if (stats.sampleCount < 10 || stats.sensorCoverage === null || stats.sensorCoverage < 0.4) {
    return "INSUFFICIENT";
  }
  if (stats.sensorCoverage >= 0.8) return "GOOD";
  if (stats.sensorCoverage >= 0.4) return "DEGRADED";
  return "POOR";
}

export function metricsForSet(
  samples: HeartRateSample[],
  input: { setId: string; exerciseId: string | null; startedAt: string; endedAt: string },
): SetHeartRateMetrics {
  const valid = validSamples(samples);
  const start = atMs(input.startedAt);
  const end = atMs(input.endedAt);
  const peak = maxInRange(valid, start, end);
  const after60 = afterOffset(valid, end, 60);
  return {
    setId: input.setId,
    exerciseId: input.exerciseId,
    heartRateBeforeSet: lastBefore(valid, start),
    heartRatePeak: peak,
    heartRateAtSetEnd: nearestInWindow(valid, end),
    heartRateAfter30Seconds: afterOffset(valid, end, 30),
    heartRateAfter60Seconds: after60,
    heartRateAfter90Seconds: afterOffset(valid, end, 90),
    heartRateAfter120Seconds: afterOffset(valid, end, 120),
    recovery60Seconds: recoveryDelta(peak, after60),
  };
}

export function setWindowsFromTimeline(events: WorkoutTimelineEvent[]): Array<{
  setId: string;
  exerciseId: string | null;
  startedAt: string;
  endedAt: string;
}> {
  const windows: Array<{
    setId: string;
    exerciseId: string | null;
    startedAt: string;
    endedAt: string;
  }> = [];
  const open = new Map<string, WorkoutTimelineEvent>();
  for (const event of events) {
    if (event.type === "SET_STARTED" && event.setId) {
      open.set(event.setId, event);
    }
    if (event.type === "SET_COMPLETED" && event.setId) {
      const started = open.get(event.setId);
      if (started) {
        windows.push({
          setId: event.setId,
          exerciseId: event.exerciseId ?? started.exerciseId ?? null,
          startedAt: started.at,
          endedAt: event.at,
        });
        open.delete(event.setId);
      }
    }
  }
  return windows;
}
