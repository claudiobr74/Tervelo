import {
  hasAnyBodyMeasurement,
  type AthleteProfileInput,
} from "@/domain/athlete/onboarding-profile";
import type { StoredAppSession } from "@/lib/auth/session-cookie";
import {
  nhostGraphqlEndpoint,
  runGraphqlAsUser,
  sessionCanReachNhost,
  type GraphqlOutcome,
} from "@/lib/nhost/graphql-server";

export type GraphqlRunner = typeof runGraphqlAsUser;

type Affected = { affected_rows: number };

const UPDATE_PROFILE = `mutation UpdateAthleteProfile(
  $birth_date: date
  $sex: String
  $height_cm: numeric
  $experience_level: String
  $availability_json: jsonb!
) {
  update_athlete_profiles(
    where: {}
    _set: {
      birth_date: $birth_date
      sex: $sex
      height_cm: $height_cm
      experience_level: $experience_level
      availability_json: $availability_json
    }
  ) { affected_rows }
}`;

const INSERT_PROFILE = `mutation InsertAthleteProfile(
  $birth_date: date
  $sex: String
  $height_cm: numeric
  $experience_level: String
  $availability_json: jsonb!
) {
  insert_athlete_profiles_one(
    object: {
      birth_date: $birth_date
      sex: $sex
      height_cm: $height_cm
      experience_level: $experience_level
      availability_json: $availability_json
    }
  ) { id }
}`;

const UPDATE_NUTRITION = `mutation UpdateNutritionProfile($routine: String, $restrictions: String, $hydration_notes: String) {
  update_nutrition_profiles(
    where: {}
    _set: { routine: $routine, restrictions: $restrictions, hydration_notes: $hydration_notes }
  ) { affected_rows }
}`;

const INSERT_NUTRITION = `mutation InsertNutritionProfile($routine: String, $restrictions: String, $hydration_notes: String) {
  insert_nutrition_profiles_one(
    object: { routine: $routine, restrictions: $restrictions, hydration_notes: $hydration_notes }
  ) { id }
}`;

const UPDATE_DISPLAY_NAME = `mutation UpdateDisplayName($display_name: String!) {
  update_profiles(where: {}, _set: { display_name: $display_name }) { affected_rows }
}`;

const INSERT_GOAL = `mutation InsertAthleteGoal($goal_type: String!) {
  insert_athlete_goals_one(object: { goal_type: $goal_type, status: "active" }) { id }
}`;

const INSERT_MEASUREMENT = `mutation InsertOnboardingMeasurement(
  $weight_kg: numeric
  $chest_cm: numeric
  $waist_cm: numeric
  $hip_cm: numeric
  $left_arm_cm: numeric
  $right_arm_cm: numeric
  $left_thigh_cm: numeric
  $right_thigh_cm: numeric
) {
  insert_body_measurements_one(
    object: {
      source: "user"
      weight_kg: $weight_kg
      chest_cm: $chest_cm
      waist_cm: $waist_cm
      hip_cm: $hip_cm
      left_arm_cm: $left_arm_cm
      right_arm_cm: $right_arm_cm
      left_thigh_cm: $left_thigh_cm
      right_thigh_cm: $right_thigh_cm
    }
  ) { id }
}`;

const INSERT_LIMITATION = `mutation InsertOnboardingLimitation($constraint_text: String!) {
  insert_athlete_limitations_one(
    object: { body_region: "geral", constraint_text: $constraint_text, active: true }
  ) { id }
}`;

function profileVariables(input: AthleteProfileInput) {
  return {
    birth_date: input.birthDate,
    sex: input.sex,
    height_cm: input.heightCm,
    experience_level: input.experienceLevel,
    availability_json: input.availability,
  };
}

function nutritionVariables(input: AthleteProfileInput) {
  return {
    routine: input.nutrition.routine,
    restrictions: input.nutrition.restrictions,
    hydration_notes: input.nutrition.hydrationNotes,
  };
}

function affectedRows(
  outcome: GraphqlOutcome<{ [field: string]: Affected | null }>,
): number | null {
  if (!outcome.ok) return null;
  const first = Object.values(outcome.data)[0];
  return first?.affected_rows ?? 0;
}

async function saveAthleteProfile(
  session: StoredAppSession,
  input: AthleteProfileInput,
  graphql: GraphqlRunner,
): Promise<boolean> {
  const variables = profileVariables(input);
  const updated = await graphql<{ update_athlete_profiles: Affected }>(
    session,
    UPDATE_PROFILE,
    variables,
  );
  const rows = affectedRows(updated);
  if (rows && rows > 0) return true;
  // O trigger de novo usuário já cria a linha. Update vazio só acontece se o
  // trigger não rodou; aí o insert simples (sem on_conflict) completa.
  if (rows === 0) {
    const inserted = await graphql(session, INSERT_PROFILE, variables);
    return inserted.ok;
  }
  return false;
}

async function saveNutrition(
  session: StoredAppSession,
  input: AthleteProfileInput,
  graphql: GraphqlRunner,
): Promise<void> {
  const variables = nutritionVariables(input);
  const updated = await graphql<{ update_nutrition_profiles: Affected }>(
    session,
    UPDATE_NUTRITION,
    variables,
  );
  const rows = affectedRows(updated);
  if (rows && rows > 0) return;
  await graphql(session, INSERT_NUTRITION, variables);
}

async function saveDisplayName(
  session: StoredAppSession,
  displayName: string | null,
  graphql: GraphqlRunner,
): Promise<void> {
  if (!displayName) return;
  await graphql(session, UPDATE_DISPLAY_NAME, { display_name: displayName });
}

async function saveGoal(
  session: StoredAppSession,
  goalType: string | null,
  graphql: GraphqlRunner,
): Promise<void> {
  if (!goalType) return;
  await graphql(session, INSERT_GOAL, { goal_type: goalType });
}

async function saveMeasurements(
  session: StoredAppSession,
  input: AthleteProfileInput,
  graphql: GraphqlRunner,
): Promise<void> {
  if (!hasAnyBodyMeasurement(input.measurements)) return;
  const m = input.measurements;
  await graphql(session, INSERT_MEASUREMENT, {
    weight_kg: m.weightKg,
    chest_cm: m.chestCm,
    waist_cm: m.waistCm,
    hip_cm: m.hipCm,
    left_arm_cm: m.leftArmCm,
    right_arm_cm: m.rightArmCm,
    left_thigh_cm: m.leftThighCm,
    right_thigh_cm: m.rightThighCm,
  });
}

async function saveLimitation(
  session: StoredAppSession,
  limitations: string | null,
  graphql: GraphqlRunner,
): Promise<void> {
  if (!limitations) return;
  await graphql(session, INSERT_LIMITATION, { constraint_text: limitations });
}

export function canPersistOnboarding(
  session: StoredAppSession | null,
): session is StoredAppSession {
  return Boolean(nhostGraphqlEndpoint() && sessionCanReachNhost(session));
}

/**
 * Grava as respostas no Hasura. O perfil do atleta já existe (trigger de
 * cadastro), então o caminho principal é UPDATE — insert com on_conflict
 * quebra quando user_id não entra nas colunas de insert.
 *
 * Falha remota não deve impedir o atleta de terminar o cadastro: o rascunho
 * continua no aparelho.
 */
export async function persistOnboardingToNhost(
  session: StoredAppSession,
  input: AthleteProfileInput,
  graphql: GraphqlRunner = runGraphqlAsUser,
): Promise<{ persisted: boolean }> {
  if (!sessionCanReachNhost(session)) {
    return { persisted: false };
  }

  const profileOk = await saveAthleteProfile(session, input, graphql);
  await saveDisplayName(session, input.displayName, graphql);
  await saveNutrition(session, input, graphql);
  await saveGoal(session, input.goalType, graphql);
  await saveMeasurements(session, input, graphql);
  await saveLimitation(session, input.limitations, graphql);
  return { persisted: profileOk };
}
