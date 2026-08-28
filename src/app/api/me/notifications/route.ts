import { NextResponse } from "next/server";
import { requireAthleteSession } from "@/lib/athlete/require-session";
import { disconnectedOrFail } from "@/lib/admin/require-session";
import { runGraphqlAsUser } from "@/lib/nhost/graphql-server";

const LIST = `
  query AthleteNotifications {
    notifications(order_by: { created_at: desc }, limit: 50) {
      id type payload read_at created_at
    }
  }
`;

export async function GET() {
  const gate = await requireAthleteSession();
  if (!gate.ok) return gate.response;
  const result = await runGraphqlAsUser(gate.session, LIST, {});
  if (!result.ok) return disconnectedOrFail(result, { notifications: [] })!;
  return NextResponse.json({ ok: true, data: result.data });
}
