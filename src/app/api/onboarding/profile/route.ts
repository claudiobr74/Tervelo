import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { athleteProfileInput } from "@/domain/athlete/onboarding-profile";
import { parseSessionCookie } from "@/lib/auth/session-cookie";
import { NHOST_SESSION_COOKIE } from "@/lib/nhost/config";
import { runGraphqlAsUser, sessionCanReachNhost } from "@/lib/nhost/graphql-server";
import { clientKeyFromRequest, consumeRateLimit } from "@/lib/security/rate-limit";

const MAX_BODY_BYTES = 16 * 1024;

const answersSchema = z
  .object({
    displayName: z.string().max(200).optional(),
    sex: z.string().max(32).nullish(),
    birthDate: z.string().max(32).optional(),
    heightCm: z.string().max(32).optional(),
    weightKg: z.string().max(32).optional(),
    experience: z.string().max(32).nullish(),
    comfortableFreeWeights: z.boolean().optional(),
    comfortableMachines: z.boolean().optional(),
    limitations: z.string().max(2000).optional(),
    goal: z.string().max(32).nullish(),
    days: z.array(z.string().max(8)).max(7).optional(),
    sessionMinutes: z.number().finite().optional(),
    mealsPerDay: z.number().finite().optional(),
    dietPattern: z.string().max(200).optional(),
    waterLiters: z.number().finite().optional(),
    usesSupplements: z.boolean().optional(),
    supplements: z.string().max(500).optional(),
    preferredPeriod: z.string().max(32).nullish(),
  })
  .strip();

const SAVE_PROFILE = `mutation SaveAthleteProfile(
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
    on_conflict: {
      constraint: athlete_profiles_user_id_key
      update_columns: [birth_date, sex, height_cm, experience_level, availability_json]
    }
  ) { id }
}`;

const SAVE_NUTRITION = `mutation SaveNutritionProfile($routine: String, $restrictions: String, $hydration_notes: String) {
  insert_nutrition_profiles_one(
    object: { routine: $routine, restrictions: $restrictions, hydration_notes: $hydration_notes }
    on_conflict: {
      constraint: nutrition_profiles_user_id_key
      update_columns: [routine, restrictions, hydration_notes]
    }
  ) { id }
}`;

const SAVE_GOAL = `mutation SaveAthleteGoal($goal_type: String!) {
  insert_athlete_goals_one(object: { goal_type: $goal_type, status: "active" }) { id }
}`;

export async function POST(request: Request) {
  if (consumeRateLimit(`onboarding-profile:${clientKeyFromRequest(request)}`, { max: 30 }) === "limited") {
    return NextResponse.json({ ok: false, error: "too_many_requests" }, { status: 429 });
  }

  const store = await cookies();
  const session = parseSessionCookie(store.get(NHOST_SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });
  }

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 });
  }

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = answersSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const input = athleteProfileInput(parsed.data);

  // Sem backend real (pré-visualização), o rascunho continua valendo no aparelho.
  if (!sessionCanReachNhost(session)) {
    return NextResponse.json({ ok: true, persisted: false });
  }

  const profile = await runGraphqlAsUser(session, SAVE_PROFILE, {
    birth_date: input.birthDate,
    sex: input.sex,
    height_cm: input.heightCm,
    experience_level: input.experienceLevel,
    availability_json: input.availability,
  });
  if (!profile.ok) {
    return NextResponse.json({ ok: false, error: profile.reason }, { status: 502 });
  }

  await runGraphqlAsUser(session, SAVE_NUTRITION, {
    routine: input.nutrition.routine,
    restrictions: input.nutrition.restrictions,
    hydration_notes: input.nutrition.hydrationNotes,
  });

  if (input.goalType) {
    await runGraphqlAsUser(session, SAVE_GOAL, { goal_type: input.goalType });
  }

  return NextResponse.json({ ok: true, persisted: true });
}
