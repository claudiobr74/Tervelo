export const LOCAL_SCHEMA_VERSION = 1;

export type SyncOpStatus =
  "PENDENTE" | "SINCRONIZANDO" | "SINCRONIZADO" | "ERRO_RECUPERAVEL" | "ERRO_PERMANENTE";

export type OfflineCapability = "OFFLINE_CRITICAL" | "OFFLINE_SUPPORTED" | "ONLINE_REQUIRED";

export type ConnectionUiKind =
  | "ONLINE_SYNCED"
  | "ONLINE_SYNCING"
  | "OFFLINE_READY"
  | "OFFLINE_PARTIAL"
  | "SYNC_PENDING"
  | "SYNC_ERROR";

export type SyncEntity =
  | "training_session"
  | "set_result"
  | "session_event"
  | "pre_workout_checkin"
  | "post_workout_checkout"
  | "heart_rate_sample_batch"
  | "body_measurement"
  | "nutrition_checkin"
  | "nutrition_hydration"
  | "nutrition_meal"
  | "file_upload";

export type SyncLane = "DATA" | "FILE";

export type SyncOperation = {
  id: string;
  tipo: string;
  entidade: SyncEntity;
  entity_id: string;
  payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  attempt_count: number;
  last_attempt_at: string | null;
  status: SyncOpStatus;
  error_code: string | null;
  dependency_ids: string[];
  schema_version: number;
  client_mutation_id: string;
  occurred_at: string;
  synced_at: string | null;
  user_id: string;
  priority: number;
  lane: SyncLane;
};

export type NewSyncOperation = {
  id: string;
  tipo: string;
  entidade: SyncEntity;
  entity_id: string;
  payload: Record<string, unknown>;
  client_mutation_id: string;
  occurred_at: string;
  user_id: string;
  dependency_ids?: string[];
  priority?: number;
  lane?: SyncLane;
  created_at?: string;
};

export type SyncSendResult =
  | { kind: "acked"; remoteId?: string }
  | { kind: "already_applied"; remoteId?: string }
  | { kind: "recoverable"; errorCode: string }
  | { kind: "permanent"; errorCode: string };

export type SyncPassMetrics = {
  sync_success: number;
  sync_failure: number;
  pending_operations: number;
  conflict_count: number;
  skipped_dependencies: number;
};

export type ConflictDomain =
  | "active_session"
  | "set_result"
  | "prescription"
  | "execution"
  | "program"
  | "measurement"
  | "nutrition"
  | "checkin"
  | "heart_rate";

export type ConflictDecision =
  "keep_local" | "keep_remote" | "keep_both" | "preserve_for_reconciliation" | "apply_domain_rule";

export type ConflictResolution = {
  decision: ConflictDecision;
  reason: string;
  discardSilent: false;
};
