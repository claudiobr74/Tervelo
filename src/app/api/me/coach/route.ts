import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAthleteSession } from "@/lib/athlete/require-session";
import { disconnectedOrFail, graphqlFailure } from "@/lib/admin/require-session";
import { ATHLETE_QUERIES } from "@/lib/athlete/queries";
import { coachReplyForPrompt, emptyCoachFacts, type CoachKnownFacts } from "@/domain/ai/coach-preview";
import { emptyNutritionContext } from "@/domain/ai/nutrition-context";
import { runGraphqlAsUser } from "@/lib/nhost/graphql-server";

type CoachGraphql = {
  body_measurements: { weight_kg: number | string | null; measured_at: string }[];
  recovery_checkins: {
    perceived_recovery: number | null;
    muscle_soreness: number | null;
    checked_in_at: string;
  }[];
  training_sessions: {
    id: string;
    status: string;
    completed_at: string | null;
    scheduled_at: string | null;
  }[];
  set_results: {
    weight_kg: number | string | null;
    reps: number | null;
    reps_in_reserve: number | string | null;
    performed_at: string;
  }[];
  nutrition_checkins: {
    energy_kcal: number | string | null;
    protein_g: number | string | null;
    carbohydrate_g: number | string | null;
    fat_g: number | string | null;
    fluid_ml: number | string | null;
    adherence: string | null;
  }[];
};

function toNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function factsFromGraphql(data: CoachGraphql, clientReason: string | null): CoachKnownFacts {
  const latestSet = data.set_results.find((row) => toNumber(row.weight_kg) !== null);
  const weight = latestSet ? toNumber(latestSet.weight_kg) : null;
  const rir = latestSet ? toNumber(latestSet.reps_in_reserve) : null;
  const prescribed = data.training_sessions.some(
    (session) => session.status === "planned" || session.status === "in_progress",
  );
  const nutrition = emptyNutritionContext();
  const lastMeal = data.nutrition_checkins[0];
  if (lastMeal) {
    nutrition.energy.estimatedIntakeKcal = toNumber(lastMeal.energy_kcal);
    nutrition.protein.estimatedIntakeGrams = toNumber(lastMeal.protein_g);
    nutrition.carbohydrate.estimatedIntakeGrams = toNumber(lastMeal.carbohydrate_g);
    nutrition.fat.estimatedIntakeGrams = toNumber(lastMeal.fat_g);
    nutrition.hydration.estimatedIntakeMl = toNumber(lastMeal.fluid_ml);
    if (lastMeal.adherence) nutrition.behavior.nutritionAdherence = lastMeal.adherence;
  }
  return {
    ...emptyCoachFacts,
    benchPressKg: weight,
    proposedBenchPressKg: weight !== null ? weight + 2 : null,
    repetitionsInReserve: rir,
    hasPrescribedSession: prescribed,
    sessionChangedToday: Boolean(clientReason),
    sessionChangeReason: clientReason,
    nutrition,
  };
}

const askSchema = z.object({
  prompt: z.string().trim().min(2).max(400),
  sessionChangeReason: z.string().trim().max(400).optional(),
});

export async function POST(request: Request) {
  const gate = await requireAthleteSession();
  if (!gate.ok) return gate.response;
  const parsed = askSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }
  const result = await runGraphqlAsUser<CoachGraphql>(
    gate.session,
    ATHLETE_QUERIES.coachFacts,
    {},
  );
  if (!result.ok) {
    if (result.reason === "nhost_unavailable") {
      const facts: CoachKnownFacts = {
        ...emptyCoachFacts,
        sessionChangeReason: parsed.data.sessionChangeReason ?? null,
        sessionChangedToday: Boolean(parsed.data.sessionChangeReason),
      };
      return NextResponse.json({
        ok: true,
        disconnected: true,
        data: { reply: coachReplyForPrompt(parsed.data.prompt, facts), source: "device" },
      });
    }
    return graphqlFailure(result.reason);
  }
  const facts = factsFromGraphql(result.data, parsed.data.sessionChangeReason ?? null);
  return NextResponse.json({
    ok: true,
    data: { reply: coachReplyForPrompt(parsed.data.prompt, facts), source: "database" },
  });
}

export async function GET() {
  const gate = await requireAthleteSession();
  if (!gate.ok) return gate.response;
  const result = await runGraphqlAsUser<CoachGraphql>(
    gate.session,
    ATHLETE_QUERIES.coachFacts,
    {},
  );
  if (!result.ok) return disconnectedOrFail(result, { facts: emptyCoachFacts })!;
  return NextResponse.json({
    ok: true,
    data: { facts: factsFromGraphql(result.data, null) },
  });
}
