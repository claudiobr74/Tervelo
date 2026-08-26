export function logEvent(event: string, fields?: Record<string, unknown>): void {
  const payload = {
    ts: new Date().toISOString(),
    service: "tervelo-web",
    event,
    ...fields,
  };
  console.info(JSON.stringify(payload));
}

export function logError(event: string, error: unknown, fields?: Record<string, unknown>): void {
  const message = error instanceof Error ? error.message : String(error);
  logEvent(event, { level: "error", message, ...fields });
}
