export type RestTimerStatus = "running" | "paused" | "completed" | "skipped";

export const TIMER_ADJUSTMENTS_SECONDS = [-15, 15, 30] as const;
export type TimerAdjustmentSeconds = (typeof TIMER_ADJUSTMENTS_SECONDS)[number];

export type RestTimer = {
  startedAt: Date;
  expectedEndAt: Date;
  durationSeconds: number;
  pausedAt: Date | null;
  remainingAtPauseSeconds: number | null;
  status: RestTimerStatus;
};

function atLeastZero(seconds: number): number {
  return Math.max(0, seconds);
}

/** Restante a partir do relógio real — não de setInterval. */
export function remainingSeconds(timer: RestTimer, now: Date): number {
  if (timer.status === "completed" || timer.status === "skipped") {
    return 0;
  }
  if (timer.status === "paused") {
    return atLeastZero(timer.remainingAtPauseSeconds ?? 0);
  }
  const ms = timer.expectedEndAt.getTime() - now.getTime();
  if (ms <= 0) return 0;
  return Math.ceil(ms / 1000);
}

export function startRestTimer(now: Date, durationSeconds: number): RestTimer {
  const duration = Math.max(0, Math.trunc(durationSeconds));
  return {
    startedAt: now,
    expectedEndAt: new Date(now.getTime() + duration * 1000),
    durationSeconds: duration,
    pausedAt: null,
    remainingAtPauseSeconds: null,
    status: duration === 0 ? "completed" : "running",
  };
}

export function pauseRestTimer(timer: RestTimer, now: Date): RestTimer {
  if (timer.status !== "running") return timer;
  const remaining = remainingSeconds(timer, now);
  if (remaining === 0) {
    return { ...timer, status: "completed", pausedAt: null, remainingAtPauseSeconds: null };
  }
  return {
    ...timer,
    status: "paused",
    pausedAt: now,
    remainingAtPauseSeconds: remaining,
  };
}

export function resumeRestTimer(timer: RestTimer, now: Date): RestTimer {
  if (timer.status !== "paused") return timer;
  const remaining = atLeastZero(timer.remainingAtPauseSeconds ?? 0);
  if (remaining === 0) {
    return { ...timer, status: "completed", pausedAt: null, remainingAtPauseSeconds: null };
  }
  return {
    ...timer,
    status: "running",
    pausedAt: null,
    remainingAtPauseSeconds: null,
    expectedEndAt: new Date(now.getTime() + remaining * 1000),
  };
}

export function adjustRestTimer(
  timer: RestTimer,
  now: Date,
  deltaSeconds: number,
): RestTimer {
  if (timer.status === "completed" || timer.status === "skipped") {
    return timer;
  }
  if (timer.status === "paused") {
    const next = atLeastZero((timer.remainingAtPauseSeconds ?? 0) + deltaSeconds);
    if (next === 0) {
      return { ...timer, status: "completed", remainingAtPauseSeconds: 0, pausedAt: now };
    }
    return { ...timer, remainingAtPauseSeconds: next };
  }
  const newEnd = new Date(timer.expectedEndAt.getTime() + deltaSeconds * 1000);
  if (newEnd.getTime() <= now.getTime()) {
    return {
      ...timer,
      expectedEndAt: now,
      status: "completed",
    };
  }
  return { ...timer, expectedEndAt: newEnd };
}

export function restartRestTimer(timer: RestTimer, now: Date): RestTimer {
  return startRestTimer(now, timer.durationSeconds);
}

export function skipRestTimer(timer: RestTimer, now: Date): RestTimer {
  return {
    ...timer,
    status: "skipped",
    pausedAt: now,
    remainingAtPauseSeconds: 0,
    expectedEndAt: now,
  };
}

export function tickRestTimer(timer: RestTimer, now: Date): RestTimer {
  if (timer.status === "running" && remainingSeconds(timer, now) === 0) {
    return { ...timer, status: "completed" };
  }
  return timer;
}
