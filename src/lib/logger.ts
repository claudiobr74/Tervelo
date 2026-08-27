export const REDACTED = "[redacted]";

const SENSITIVE_KEY =
  /email|password|passwd|secret|token|authorization|cookie|refresh|access.?token|bpm|heart.?rate|heartRate|weight|load_?kg|calories|protein|carbohydrate|fat_g|energy_kcal|displayName|notes/i;

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const JWT_RE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

function looksSensitiveString(value: string): boolean {
  return EMAIL_RE.test(value) || JWT_RE.test(value);
}

export function redactValue(value: unknown, key?: string): unknown {
  if (key && SENSITIVE_KEY.test(key)) {
    return REDACTED;
  }
  if (typeof value === "string") {
    return looksSensitiveString(value) ? REDACTED : value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item));
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [nestedKey, nested] of Object.entries(value as Record<string, unknown>)) {
      out[nestedKey] = redactValue(nested, nestedKey);
    }
    return out;
  }
  return value;
}

export function sanitizeLogFields(fields?: Record<string, unknown>): Record<string, unknown> {
  if (!fields) return {};
  return redactValue(fields) as Record<string, unknown>;
}

export function logEvent(event: string, fields?: Record<string, unknown>): void {
  const payload = {
    ts: new Date().toISOString(),
    service: "tervelo-web",
    event,
    ...sanitizeLogFields(fields),
  };
  console.info(JSON.stringify(payload));
}

export function logError(event: string, error: unknown, fields?: Record<string, unknown>): void {
  const raw = error instanceof Error ? error.message : String(error);
  const message = typeof redactValue(raw) === "string" ? (redactValue(raw) as string) : REDACTED;
  logEvent(event, { level: "error", message, ...fields });
}
