import { NextResponse } from "next/server";
import { disconnectedOrFail, requireAdminContext } from "@/lib/admin/require-session";
import { ADMIN_QUERIES } from "@/lib/admin/queries";
import { runGraphqlAsUser } from "@/lib/nhost/graphql-server";

function startOfTodayIso(): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  ).toISOString();
}

function startOfWeekIso(): string {
  const today = new Date(startOfTodayIso());
  today.setUTCDate(today.getUTCDate() - 7);
  return today.toISOString();
}

const EMPTY = {
  activeUsers: 0,
  newThisWeek: 0,
  workoutsToday: 0,
  adherencePercent: null as number | null,
  connected: false,
};

export async function GET() {
  const gate = await requireAdminContext();
  if (!gate.ok) return gate.response;
  const today = startOfTodayIso();
  const weekStart = startOfWeekIso();
  const result = await runGraphqlAsUser<{
    profiles: { id: string; created_at: string }[];
    today_sessions: { id: string; status: string }[];
    week_sessions: { id: string; status: string }[];
  }>(gate.context.session, ADMIN_QUERIES.overview, { today, weekStart }, "admin");
  if (!result.ok) return disconnectedOrFail(result, EMPTY)!;
  const profiles = result.data.profiles;
  const week = result.data.week_sessions;
  const completed = week.filter((row) => row.status === "completed").length;
  return NextResponse.json({
    ok: true,
    data: {
      activeUsers: profiles.length,
      newThisWeek: profiles.filter((row) => row.created_at >= weekStart).length,
      workoutsToday: result.data.today_sessions.length,
      adherencePercent: week.length === 0 ? null : Math.round((completed / week.length) * 100),
      connected: true,
    },
  });
}
