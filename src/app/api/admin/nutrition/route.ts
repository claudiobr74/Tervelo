import { NextResponse } from "next/server";
import { disconnectedOrFail, requireAdminContext } from "@/lib/admin/require-session";
import { ADMIN_QUERIES } from "@/lib/admin/queries";
import { runGraphqlAsUser } from "@/lib/nhost/graphql-server";

const EMPTY = { nutrition_profiles: [], nutrition_targets: [] };

export async function GET() {
  const gate = await requireAdminContext();
  if (!gate.ok) return gate.response;
  const result = await runGraphqlAsUser(gate.context.session, ADMIN_QUERIES.nutrition, {}, "admin");
  if (!result.ok) return disconnectedOrFail(result, EMPTY)!;
  return NextResponse.json({ ok: true, data: result.data });
}
