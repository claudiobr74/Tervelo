const DELAYS_MS = [1_000, 2_000, 4_000, 8_000, 16_000, 30_000] as const;

export function retryDelayMs(attemptCount: number): number {
  const index = Math.min(Math.max(0, attemptCount - 1), DELAYS_MS.length - 1);
  return DELAYS_MS[index];
}

export function nextRetryAt(attemptCount: number, lastAttemptAt: Date): Date {
  return new Date(lastAttemptAt.getTime() + retryDelayMs(attemptCount));
}

export function canRetryAt(input: {
  attemptCount: number;
  lastAttemptAt: string | null;
  now: Date;
  force?: boolean;
}): boolean {
  if (input.force) return true;
  if (!input.lastAttemptAt || input.attemptCount <= 0) return true;
  const last = new Date(input.lastAttemptAt);
  if (Number.isNaN(last.getTime())) return true;
  return input.now.getTime() >= nextRetryAt(input.attemptCount, last).getTime();
}

export const RECOVERABLE_ERROR_CODES = new Set([
  "network",
  "timeout",
  "nhost_unavailable",
  "nhost_request_failed",
  "rate_limit",
  "server_temporary",
]);

export const PERMANENT_ERROR_CODES = new Set([
  "invalid_schema",
  "permission_denied",
  "entity_removed",
  "validation_impossible",
]);

export function classifyErrorCode(errorCode: string): "recoverable" | "permanent" {
  if (PERMANENT_ERROR_CODES.has(errorCode)) return "permanent";
  return "recoverable";
}
