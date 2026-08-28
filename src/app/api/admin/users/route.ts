import { NextResponse } from "next/server";
import { disconnectedOrFail, requireAdminContext } from "@/lib/admin/require-session";
import { ADMIN_QUERIES } from "@/lib/admin/queries";
import { runGraphqlAsUser } from "@/lib/nhost/graphql-server";

type UserRow = {
  id: string;
  name: string;
  locale: string;
  createdAt: string;
  goals: string[];
  lastSession: string | null;
};

export async function GET() {
  const gate = await requireAdminContext();
  if (!gate.ok) return gate.response;
  const result = await runGraphqlAsUser<{
    profiles: { id: string; display_name: string; locale: string; created_at: string }[];
    athlete_goals: { user_id: string; goal_type: string; status: string }[];
    training_sessions: {
      user_id: string;
      status: string;
      completed_at: string | null;
      started_at: string | null;
    }[];
  }>(gate.context.session, ADMIN_QUERIES.users, {}, "admin");
  if (!result.ok) return disconnectedOrFail<UserRow[]>(result, [])!;

  const goalsByUser = new Map<string, string[]>();
  for (const goal of result.data.athlete_goals) {
    const list = goalsByUser.get(goal.user_id) ?? [];
    list.push(goal.goal_type);
    goalsByUser.set(goal.user_id, list);
  }
  const lastSession = new Map<string, string>();
  for (const session of result.data.training_sessions) {
    if (lastSession.has(session.user_id)) continue;
    const stamp = session.completed_at ?? session.started_at;
    if (stamp) lastSession.set(session.user_id, stamp);
  }

  return NextResponse.json({
    ok: true,
    data: result.data.profiles.map((profile) => ({
      id: profile.id,
      name: profile.display_name || profile.id.slice(0, 8),
      locale: profile.locale,
      createdAt: profile.created_at,
      goals: goalsByUser.get(profile.id) ?? [],
      lastSession: lastSession.get(profile.id) ?? null,
    })),
  });
}
