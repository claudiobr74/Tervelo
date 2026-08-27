import { isLocalNhost } from "@/lib/auth/local-preview";
import { SYNC_GRAPHQL_ENDPOINT } from "@/lib/offline/sync-endpoint";
import type { SyncOperation, SyncSendResult } from "@/domain/offline";

/**
 * O token de acesso fica num cookie `httpOnly`, invisível para o navegador.
 * A operação vai para a ponte no servidor, que anexa a identidade do usuário.
 */
async function graphql(query: string, variables: Record<string, unknown>): Promise<void> {
  if (isLocalNhost()) {
    throw new Error("nhost_unavailable");
  }
  const response = await fetch(SYNC_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (response.status === 429) throw new Error("rate_limit");
  if (response.status === 401) throw new Error("permission_denied");
  if (response.status === 503) throw new Error("nhost_unavailable");
  if (!response.ok) throw new Error("nhost_request_failed");
  const json = (await response.json()) as {
    errors?: { message?: string; extensions?: { code?: string } }[];
  };
  if (json.errors?.length) {
    const message = json.errors[0]?.message ?? "";
    const code = json.errors[0]?.extensions?.code;
    if (code === "permission-error" || code === "invalid-jwt" || code === "access-denied") {
      throw new Error("permission_denied");
    }
    if (/uniqueness|unique constraint|already exists/i.test(message)) {
      throw new Error("already_applied");
    }
    throw new Error("nhost_request_failed");
  }
}

export async function transportSyncOperation(op: SyncOperation): Promise<SyncSendResult> {
  if (op.lane === "FILE") {
    // Upload de mídia ainda não existe: repetir para sempre só entupiria a fila.
    return { kind: "permanent", errorCode: "sem_transporte" };
  }

  const clientMutationId = op.client_mutation_id;
  const occurredAt = op.occurred_at;

  try {
    if (op.entidade === "set_result") {
      await graphql(
        `
          mutation InsertSetResult(
            $set_id: uuid!
            $weight_kg: numeric
            $reps: Int
            $client_mutation_id: uuid!
            $performed_at: timestamptz!
          ) {
            insert_set_results_one(
              object: {
                set_id: $set_id
                weight_kg: $weight_kg
                reps: $reps
                client_mutation_id: $client_mutation_id
                performed_at: $performed_at
              }
            ) {
              id
            }
          }
        `,
        {
          set_id: op.payload.setId ?? op.entity_id,
          weight_kg: op.payload.weightKg ?? null,
          reps: op.payload.reps ?? null,
          client_mutation_id: clientMutationId,
          performed_at: occurredAt,
        },
      );
      return { kind: "acked" };
    }

    if (op.entidade === "pre_workout_checkin") {
      await graphql(
        `
          mutation InsertPreWorkoutCheckin(
            $status: String!
            $sleep_quality: smallint
            $energy: smallint
            $muscle_recovery: smallint
            $stress: smallint
            $has_pain: Boolean
            $available_minutes: Int
            $client_mutation_id: uuid!
          ) {
            insert_pre_workout_checkins_one(
              object: {
                status: $status
                sleep_quality: $sleep_quality
                energy: $energy
                muscle_recovery: $muscle_recovery
                stress: $stress
                has_pain: $has_pain
                available_minutes: $available_minutes
                client_mutation_id: $client_mutation_id
              }
            ) {
              id
            }
          }
        `,
        {
          status: op.payload.status ?? "completed",
          sleep_quality: op.payload.sleepQuality ?? null,
          energy: op.payload.energy ?? null,
          muscle_recovery: op.payload.muscleRecovery ?? null,
          stress: op.payload.stress ?? null,
          has_pain: op.payload.hasPain ?? null,
          available_minutes: op.payload.availableMinutes ?? null,
          client_mutation_id: clientMutationId,
        },
      );
      return { kind: "acked" };
    }

    if (op.entidade === "post_workout_checkout") {
      await graphql(
        `
          mutation InsertPostWorkoutCheckout(
            $status: String!
            $expectation: String
            $difficulty: String
            $plan_completion: String
            $had_pain: Boolean
            $client_mutation_id: uuid!
          ) {
            insert_post_workout_checkouts_one(
              object: {
                status: $status
                expectation: $expectation
                difficulty: $difficulty
                plan_completion: $plan_completion
                had_pain: $had_pain
                client_mutation_id: $client_mutation_id
              }
            ) {
              id
            }
          }
        `,
        {
          status: op.payload.status ?? "completed",
          expectation: op.payload.expectation ?? null,
          difficulty: op.payload.difficulty ?? null,
          plan_completion: op.payload.planCompletion ?? null,
          had_pain: op.payload.hadPain ?? null,
          client_mutation_id: clientMutationId,
        },
      );
      return { kind: "acked" };
    }

    if (op.entidade === "body_measurement") {
      await graphql(
        `
          mutation InsertBodyMeasurement(
            $measured_at: timestamptz
            $weight_kg: numeric
            $body_fat_percent: numeric
            $waist_cm: numeric
            $right_arm_cm: numeric
            $right_thigh_cm: numeric
          ) {
            insert_body_measurements_one(
              object: {
                measured_at: $measured_at
                weight_kg: $weight_kg
                body_fat_percent: $body_fat_percent
                waist_cm: $waist_cm
                right_arm_cm: $right_arm_cm
                right_thigh_cm: $right_thigh_cm
              }
            ) {
              id
            }
          }
        `,
        {
          measured_at: occurredAt,
          weight_kg: op.payload.weightKg ?? null,
          body_fat_percent: op.payload.bodyFatPercent ?? null,
          waist_cm: op.payload.waistCm ?? null,
          right_arm_cm: op.payload.rightArmCm ?? null,
          right_thigh_cm: op.payload.rightThighCm ?? null,
        },
      );
      return { kind: "acked" };
    }

    if (
      op.entidade === "nutrition_checkin" ||
      op.entidade === "nutrition_hydration" ||
      op.entidade === "nutrition_meal"
    ) {
      await graphql(
        `
          mutation InsertNutritionCheckin(
            $checked_in_on: date!
            $energy_kcal: Int
            $protein_g: numeric
            $carbohydrate_g: numeric
            $fat_g: numeric
            $fluid_ml: Int
            $adherence: String
            $notes: String
          ) {
            insert_nutrition_checkins_one(
              object: {
                checked_in_on: $checked_in_on
                energy_kcal: $energy_kcal
                protein_g: $protein_g
                carbohydrate_g: $carbohydrate_g
                fat_g: $fat_g
                fluid_ml: $fluid_ml
                adherence: $adherence
                notes: $notes
              }
            ) {
              id
            }
          }
        `,
        {
          checked_in_on: String(op.payload.checkedInOn ?? occurredAt.slice(0, 10)),
          energy_kcal: op.payload.energyKcal ?? null,
          protein_g: op.payload.proteinG ?? null,
          carbohydrate_g: op.payload.carbohydrateG ?? null,
          fat_g: op.payload.fatG ?? null,
          fluid_ml: op.payload.fluidMl ?? null,
          adherence: op.payload.adherence ?? null,
          notes: op.payload.notes ?? null,
        },
      );
      return { kind: "acked" };
    }

    if (op.entidade === "training_session") {
      if (op.tipo === "SESSION_STARTED") {
        await graphql(
          `
            mutation StartTrainingSession($started_at: timestamptz!, $client_mutation_id: uuid!) {
              insert_training_sessions_one(
                object: {
                  started_at: $started_at
                  status: "in_progress"
                  client_mutation_id: $client_mutation_id
                }
              ) {
                id
              }
            }
          `,
          { started_at: occurredAt, client_mutation_id: clientMutationId },
        );
        return { kind: "acked" };
      }
      if (op.tipo === "SESSION_COMPLETED") {
        const startedId = op.dependency_ids?.[0] ?? null;
        await graphql(
          `
            mutation CompleteTrainingSession(
              $client_mutation_id: uuid!
              $completed_at: timestamptz!
            ) {
              update_training_sessions(
                where: { client_mutation_id: { _eq: $client_mutation_id } }
                _set: { completed_at: $completed_at, status: "completed" }
              ) {
                affected_rows
              }
            }
          `,
          { client_mutation_id: startedId ?? clientMutationId, completed_at: occurredAt },
        );
        return { kind: "acked" };
      }
    }

    // Sem transporte para esta entidade: falhar de vez em vez de repetir para sempre.
    return { kind: "permanent", errorCode: "sem_transporte" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "network";
    if (message === "already_applied") return { kind: "already_applied" };
    if (
      message === "permission_denied" ||
      message === "invalid_schema" ||
      message === "entity_removed"
    ) {
      return { kind: "permanent", errorCode: message };
    }
    return { kind: "recoverable", errorCode: message };
  }
}
