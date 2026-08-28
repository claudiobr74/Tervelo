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
  const result = await runGraphqlAsUser(gate.context.session, ADMIN_QUERIES.gyms, {}, "admin");
  if (!result.ok) return disconnectedOrFail(result, { gyms: [] })!;
  return NextResponse.json({ ok: true, data: result.data });
}

const insertSchema = z.object({
  name: z.string().trim().min(2).max(120),
  notes: z.string().trim().max(2_000).optional(),
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
    ADMIN_QUERIES.insertGym,
    { name: parsed.data.name, notes: parsed.data.notes ?? null },
    "admin",
  );
  if (!result.ok) return graphqlFailure(result.reason);
  return NextResponse.json({ ok: true, data: result.data });
}
