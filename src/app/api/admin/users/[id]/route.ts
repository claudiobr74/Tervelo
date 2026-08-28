import { NextResponse } from "next/server";
import { disconnectedOrFail, requireAdminContext } from "@/lib/admin/require-session";
import { ATHLETE_QUERIES } from "@/lib/athlete/queries";
import { runGraphqlAsUser } from "@/lib/nhost/graphql-server";

type UserDetail = {
  profiles: {
    id: string;
    display_name: string;
    locale: string;
    created_at: string;
    theme_preference: string | null;
  }[];
  athlete_profiles: {
    birth_date: string | null;
    sex: string | null;
    height_cm: number | string | null;
    experience_level: string | null;
  }[];
  athlete_goals: { id: string; goal_type: string; status: string; notes: string | null; created_at: string }[];
  training_programs: { id: string; title: string; status: string; started_on: string | null }[];
  training_sessions: {
    id: string;
    status: string;
    scheduled_at: string | null;
    started_at: string | null;
    completed_at: string | null;
  }[];
  body_measurements: {
    measured_at: string;
    weight_kg: number | string | null;
    body_fat_percent: number | string | null;
  }[];
};

const EMPTY_DETAIL = {
  profile: null as UserDetail["profiles"][number] | null,
  athlete: null as UserDetail["athlete_profiles"][number] | null,
  goals: [] as UserDetail["athlete_goals"],
  programs: [] as UserDetail["training_programs"],
  sessions: [] as UserDetail["training_sessions"],
  measurements: [] as UserDetail["body_measurements"],
};

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminContext();
  if (!gate.ok) return gate.response;
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  const result = await runGraphqlAsUser<UserDetail>(
    gate.context.session,
    ATHLETE_QUERIES.adminUser,
    { id },
    "admin",
  );
  if (!result.ok) return disconnectedOrFail(result, EMPTY_DETAIL)!;
  const profile = result.data.profiles[0];
  if (!profile) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({
    ok: true,
    data: {
      profile,
      athlete: result.data.athlete_profiles[0] ?? null,
      goals: result.data.athlete_goals,
      programs: result.data.training_programs,
      sessions: result.data.training_sessions,
      measurements: result.data.body_measurements,
    },
  });
}
