export type OfflineMetricName =
  | "sync_success"
  | "sync_failure"
  | "pending_operations"
  | "sync_latency"
  | "conflict_count"
  | "offline_session_started"
  | "offline_session_completed"
  | "recovered_active_session";

export type OfflineMetric = {
  name: OfflineMetricName;
  value: number;
  at: string;
};

export function metricEvent(name: OfflineMetricName, value: number, at = new Date().toISOString()): OfflineMetric {
  return { name, value, at };
}

export function sanitizeSyncLog(input: {
  opId: string;
  entity: string;
  status: string;
  errorCode?: string | null;
}): Record<string, string> {
  return {
    opId: input.opId,
    entity: input.entity,
    status: input.status,
    errorCode: input.errorCode ?? "",
  };
}
