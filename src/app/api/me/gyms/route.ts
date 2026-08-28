import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAthleteSession } from "@/lib/athlete/require-session";
import { disconnectedOrFail, graphqlFailure } from "@/lib/admin/require-session";
import { runGraphqlAsUser } from "@/lib/nhost/graphql-server";

const LIST = `
  query AthleteGyms {
    gyms(order_by: { name: asc }, limit: 50) {
      id name notes owner_user_id
    }
  }
`;

const INSERT = `
  mutation AthleteInsertGym($name: String!, $notes: String) {
    insert_gyms_one(object: { name: $name, notes: $notes }) { id name notes owner_user_id }
  }
`;

export async function GET() {
  const gate = await requireAthleteSession();
  if (!gate.ok) return gate.response;
  const result = await runGraphqlAsUser(gate.session, LIST, {});
  if (!result.ok) return disconnectedOrFail(result, { gyms: [] })!;
  return NextResponse.json({ ok: true, data: result.data });
}

const insertSchema = z.object({
  name: z.string().trim().min(2).max(120),
  notes: z.string().trim().max(2_000).optional(),
});

export async function POST(request: Request) {
  const gate = await requireAthleteSession();
  if (!gate.ok) return gate.response;
  const parsed = insertSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }
  const result = await runGraphqlAsUser(gate.session, INSERT, {
    name: parsed.data.name,
    notes: parsed.data.notes ?? null,
  });
  if (!result.ok) return graphqlFailure(result.reason);
  return NextResponse.json({ ok: true, data: result.data });
}
