import { err, ok, type Result } from "../result";

export const RECOVERY_SCALE_MIN = 1;
export const RECOVERY_SCALE_MAX = 5;
export const MIN_POINTS_FOR_TREND = 3;

export type RecoveryScores = {
  sleepQuality: number;
  energy: number;
  mood: number;
  muscleSoreness: number;
  discomfort: number;
  stress: number;
  perceivedRecovery: number;
};

export type RecoveryCheckin = RecoveryScores & {
  id: string;
  checkedInAt: Date;
};

export type RecoveryTrend = {
  sampleSize: number;
  windowDays: number;
  averages: RecoveryScores;
};

export type TrendError = { code: "insufficient_history"; sampleSize: number };

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/** IA usa janela, não um ponto único. */
export function recoveryTrend(
  checkins: readonly RecoveryCheckin[],
  now: Date,
  windowDays: number,
): Result<RecoveryTrend, TrendError> {
  const since = now.getTime() - windowDays * 24 * 60 * 60 * 1000;
  const windowed = checkins.filter((row) => row.checkedInAt.getTime() >= since);
  if (windowed.length < MIN_POINTS_FOR_TREND) {
    return err({ code: "insufficient_history", sampleSize: windowed.length });
  }
  return ok({
    sampleSize: windowed.length,
    windowDays,
    averages: {
      sleepQuality: average(windowed.map((row) => row.sleepQuality)),
      energy: average(windowed.map((row) => row.energy)),
      mood: average(windowed.map((row) => row.mood)),
      muscleSoreness: average(windowed.map((row) => row.muscleSoreness)),
      discomfort: average(windowed.map((row) => row.discomfort)),
      stress: average(windowed.map((row) => row.stress)),
      perceivedRecovery: average(windowed.map((row) => row.perceivedRecovery)),
    },
  });
}
