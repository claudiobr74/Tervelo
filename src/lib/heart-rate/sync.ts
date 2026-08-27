import { isLocalNhost } from "@/lib/auth/local-preview";
import { SYNC_GRAPHQL_ENDPOINT } from "@/lib/offline/sync-endpoint";
import type { BufferedHeartRateSample } from "@/domain/heart-rate/buffer";
import { HEART_RATE_PROCESSING_VERSION } from "@/domain/heart-rate/types";
import type { HeartRateSessionStats } from "@/domain/heart-rate/types";

type WearablePayload = {
  id: string;
  displayName: string;
  lastConnectedAt: string;
  isActive: boolean;
};

/** Mesma ponte da fila offline: o token de sessão não é legível pelo navegador. */
async function graphql<T>(query: string, variables: Record<string, unknown>): Promise<T | null> {
  if (isLocalNhost()) return null;
  const response = await fetch(SYNC_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (response.status === 503) return null;
  if (!response.ok) throw new Error("nhost_graphql_failed");
  const json = (await response.json()) as { data?: T; errors?: unknown };
  if (json.errors) throw new Error("nhost_graphql_errors");
  return json.data ?? null;
}

export async function upsertWearableDevice(device: WearablePayload): Promise<void> {
  await graphql(
    `
      mutation UpsertWearable(
        $id: uuid!
        $display_name: String!
        $last_connected_at: timestamptz!
        $is_active: Boolean!
      ) {
        insert_wearable_devices_one(
          object: {
            id: $id
            provider: "web_bluetooth"
            display_name: $display_name
            device_type: "heart_rate_monitor"
            last_connected_at: $last_connected_at
            is_active: $is_active
          }
          on_conflict: {
            constraint: wearable_devices_pkey
            update_columns: [display_name, last_connected_at, is_active]
          }
        ) {
          id
        }
      }
    `,
    {
      id: device.id,
      display_name: device.displayName,
      last_connected_at: device.lastConnectedAt,
      is_active: device.isActive,
    },
  );
}

export async function upsertHeartRateSession(input: {
  id: string;
  userId: string;
  trainingSessionId: string;
  wearableDeviceId: string | null;
  startedAt: string | null;
  endedAt: string | null;
  stats: HeartRateSessionStats | null;
}): Promise<void> {
  const sessionUuid = asUuid(input.trainingSessionId);
  await graphql(
    `mutation UpsertHeartRateSession(
      $id: uuid!
      $training_session_id: uuid
      $wearable_device_id: uuid
      $started_at: timestamptz
      $ended_at: timestamptz
      $average_bpm: Int
      $maximum_bpm: Int
      $minimum_bpm: Int
      $sample_count: Int!
      $sensor_coverage: numeric
    ) {
      insert_heart_rate_sessions_one(
        object: {
          id: $id
          training_session_id: $training_session_id
          wearable_device_id: $wearable_device_id
          started_at: $started_at
          ended_at: $ended_at
          average_bpm: $average_bpm
          maximum_bpm: $maximum_bpm
          minimum_bpm: $minimum_bpm
          sample_count: $sample_count
          sensor_coverage: $sensor_coverage
          processing_version: "${HEART_RATE_PROCESSING_VERSION}"
        }
        on_conflict: {
          constraint: heart_rate_sessions_pkey
          update_columns: [ended_at, average_bpm, maximum_bpm, minimum_bpm, sample_count, sensor_coverage]
        }
      ) { id }
    }`,
    {
      id: input.id,
      training_session_id: sessionUuid,
      wearable_device_id: input.wearableDeviceId,
      started_at: input.startedAt,
      ended_at: input.endedAt,
      average_bpm: input.stats?.averageBpm ?? null,
      maximum_bpm: input.stats?.maximumBpm ?? null,
      minimum_bpm: input.stats?.minimumBpm ?? null,
      sample_count: input.stats?.sampleCount ?? 0,
      sensor_coverage: input.stats?.sensorCoverage ?? null,
    },
  );
}

export async function insertHeartRateSamples(input: {
  heartRateSessionId: string;
  userId: string;
  trainingSessionId: string;
  samples: BufferedHeartRateSample[];
}): Promise<void> {
  const sessionUuid = asUuid(input.trainingSessionId);
  const objects = input.samples.map((sample) => ({
    id: sample.id,
    heart_rate_session_id: input.heartRateSessionId,
    training_session_id: sessionUuid,
    exercise_id: sample.exerciseId,
    set_id: sample.setId,
    recorded_at: sample.recordedAt,
    bpm: sample.bpm,
    source: sample.source,
    is_valid: sample.isValid,
    quality: sample.quality,
    quality_reason: sample.qualityReason,
    client_mutation_id: sample.clientMutationId,
  }));
  await graphql(
    `
      mutation InsertHeartRateSamples($objects: [heart_rate_samples_insert_input!]!) {
        insert_heart_rate_samples(
          objects: $objects
          on_conflict: {
            constraint: heart_rate_samples_user_id_client_mutation_id_key
            update_columns: []
          }
        ) {
          affected_rows
        }
      }
    `,
    { objects },
  );
}

function asUuid(value: string): string | null {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ? value
    : null;
}
