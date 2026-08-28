import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAthleteSession } from "@/lib/athlete/require-session";
import { disconnectedOrFail, graphqlFailure } from "@/lib/admin/require-session";
import { ATHLETE_QUERIES } from "@/lib/athlete/queries";
import { mapAthleteSessions, mapWorkouts, type TrainingGraphql } from "@/lib/athlete/map-workout";
import { runGraphqlAsUser } from "@/lib/nhost/graphql-server";

const EMPTY: TrainingGraphql = {
  training_programs: [],
  training_blocks: [],
  training_weeks: [],
  training_sessions: [],
  session_exercises: [],
  exercise_sets: [],
  exercise_variants: [],
  canonical_exercises: [],
};

export async function GET() {
  const gate = await requireAthleteSession();
  if (!gate.ok) return gate.response;
  const result = await runGraphqlAsUser<TrainingGraphql>(
    gate.session,
    ATHLETE_QUERIES.training,
    {},
  );
  if (!result.ok) {
    return disconnectedOrFail(result, {
      programs: [],
      sessions: [],
      workouts: [],
    })!;
  }
  return NextResponse.json({
    ok: true,
    data: {
      programs: result.data.training_programs,
      sessions: mapAthleteSessions(result.data),
      workouts: mapWorkouts(result.data),
    },
  });
}

const createSchema = z.object({
  title: z.string().trim().min(2).max(80),
  scheduledAt: z.string().min(10).max(40),
  gymId: z.string().uuid().optional(),
  exercises: z
    .array(
      z.object({
        namePt: z.string().trim().min(2).max(120),
        canonicalExerciseId: z.string().uuid().optional(),
        restSeconds: z.number().int().min(0).max(600).optional(),
        sets: z
          .array(
            z.object({
              repsMin: z.number().int().min(1).max(50),
              repsMax: z.number().int().min(1).max(50),
              weightKg: z.number().positive().max(500).optional(),
            }),
          )
          .max(12)
          .optional(),
      }),
    )
    .min(1)
    .max(20),
});

export async function POST(request: Request) {
  const gate = await requireAthleteSession();
  if (!gate.ok) return gate.response;
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }
  const body = parsed.data;
  const startedOn = body.scheduledAt.slice(0, 10);

  const program = await runGraphqlAsUser<{
    insert_training_programs_one: { id: string; title: string } | null;
  }>(gate.session, ATHLETE_QUERIES.insertProgram, {
    title: body.title,
    started_on: startedOn,
  });
  if (!program.ok || !program.data.insert_training_programs_one) {
    return program.ok ? graphqlFailure("graphql_error") : graphqlFailure(program.reason);
  }
  const programId = program.data.insert_training_programs_one.id;

  const block = await runGraphqlAsUser<{ insert_training_blocks_one: { id: string } | null }>(
    gate.session,
    ATHLETE_QUERIES.insertBlock,
    { program_id: programId, name: body.title },
  );
  if (!block.ok || !block.data.insert_training_blocks_one) {
    return block.ok ? graphqlFailure("graphql_error") : graphqlFailure(block.reason);
  }

  const week = await runGraphqlAsUser<{ insert_training_weeks_one: { id: string } | null }>(
    gate.session,
    ATHLETE_QUERIES.insertWeek,
    { block_id: block.data.insert_training_blocks_one.id },
  );
  if (!week.ok || !week.data.insert_training_weeks_one) {
    return week.ok ? graphqlFailure("graphql_error") : graphqlFailure(week.reason);
  }

  const session = await runGraphqlAsUser<{
    insert_training_sessions_one: {
      id: string;
      scheduled_at: string | null;
      status: string;
    } | null;
  }>(gate.session, ATHLETE_QUERIES.insertSession, {
    week_id: week.data.insert_training_weeks_one.id,
    scheduled_at: body.scheduledAt,
    gym_id: body.gymId ?? null,
  });
  if (!session.ok || !session.data.insert_training_sessions_one) {
    return session.ok ? graphqlFailure("graphql_error") : graphqlFailure(session.reason);
  }
  const sessionId = session.data.insert_training_sessions_one.id;

  for (const [index, exercise] of body.exercises.entries()) {
    const row = await runGraphqlAsUser<{ insert_session_exercises_one: { id: string } | null }>(
      gate.session,
      ATHLETE_QUERIES.insertSessionExercise,
      {
        session_id: sessionId,
        position: index + 1,
        notes: exercise.namePt,
        rest_seconds: exercise.restSeconds ?? 90,
        planned_equipment_id: null,
        exercise_variant_id: null,
      },
    );
    if (!row.ok || !row.data.insert_session_exercises_one) {
      return row.ok ? graphqlFailure("graphql_error") : graphqlFailure(row.reason);
    }
    const sets =
      exercise.sets && exercise.sets.length > 0
        ? exercise.sets
        : [
            { repsMin: 8, repsMax: 12 },
            { repsMin: 8, repsMax: 12 },
            { repsMin: 8, repsMax: 12 },
          ];
    for (const [setIndex, set] of sets.entries()) {
      const inserted = await runGraphqlAsUser(gate.session, ATHLETE_QUERIES.insertExerciseSet, {
        session_exercise_id: row.data.insert_session_exercises_one.id,
        set_index: setIndex + 1,
        target_reps_min: set.repsMin,
        target_reps_max: set.repsMax,
        target_weight_kg: set.weightKg ?? null,
      });
      if (!inserted.ok) return graphqlFailure(inserted.reason);
    }
  }

  return NextResponse.json({
    ok: true,
    data: { sessionId, programId },
  });
}
