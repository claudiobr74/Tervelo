type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function consumeRateLimit(
  key: string,
  options: { windowMs?: number; max?: number; now?: number } = {},
): "ok" | "limited" {
  const windowMs = options.windowMs ?? 60_000;
  const max = options.max ?? 30;
  const now = options.now ?? Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return "ok";
  }
  if (current.count >= max) {
    return "limited";
  }
  current.count += 1;
  return "ok";
}

export function clientKeyFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "local";
}

export function resetRateLimitForTests(): void {
  buckets.clear();
}
