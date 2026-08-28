import { NextResponse } from "next/server";
import { z } from "zod";
import {
  disconnectedOrFail,
  graphqlFailure,
  requireAdminContext,
} from "@/lib/admin/require-session";
import { ADMIN_QUERIES } from "@/lib/admin/queries";
import { runGraphqlAsUser } from "@/lib/nhost/graphql-server";

export async function GET() {
  const gate = await requireAdminContext();
  if (!gate.ok) return gate.response;
  const result = await runGraphqlAsUser<{
    canonical_exercises: {
      id: string;
      name_pt: string;
      description: string | null;
      movement_pattern_id: string | null;
    }[];
    exercise_aliases: { alias: string; locale: string; canonical_exercise_id: string }[];
    movement_patterns: { id: string; slug: string; name_pt: string }[];
  }>(gate.context.session, ADMIN_QUERIES.exercises, {}, "admin");
  if (!result.ok) return disconnectedOrFail(result, { patterns: [], exercises: [] })!;
  const aliases = new Map<string, string[]>();
  for (const row of result.data.exercise_aliases) {
    const list = aliases.get(row.canonical_exercise_id) ?? [];
    list.push(row.alias);
    aliases.set(row.canonical_exercise_id, list);
  }
  const patterns = new Map(result.data.movement_patterns.map((item) => [item.id, item.name_pt]));
  return NextResponse.json({
    ok: true,
    data: {
      patterns: result.data.movement_patterns,
      exercises: result.data.canonical_exercises.map((exercise) => ({
        id: exercise.id,
        namePt: exercise.name_pt,
        description: exercise.description,
        movementPatternId: exercise.movement_pattern_id,
        movementPattern: exercise.movement_pattern_id
          ? (patterns.get(exercise.movement_pattern_id) ?? "")
          : "",
        aliases: aliases.get(exercise.id) ?? [],
      })),
    },
  });
}

const insertSchema = z.object({
  namePt: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2_000).optional(),
  movementPatternId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  const gate = await requireAdminContext();
  if (!gate.ok) return gate.response;
  const parsed = insertSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }
  const result = await runGraphqlAsUser(
    gate.context.session,
    ADMIN_QUERIES.insertExercise,
    {
      name_pt: parsed.data.namePt,
      description: parsed.data.description ?? null,
      movement_pattern_id: parsed.data.movementPatternId ?? null,
    },
    "admin",
  );
  if (!result.ok) return graphqlFailure(result.reason);
  return NextResponse.json({ ok: true, data: result.data });
}
