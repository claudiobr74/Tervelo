import { NextResponse } from "next/server";
import { disconnectedOrFail, requireAdminContext } from "@/lib/admin/require-session";
import { ADMIN_QUERIES } from "@/lib/admin/queries";
import { runGraphqlAsUser } from "@/lib/nhost/graphql-server";

export async function GET() {
  const gate = await requireAdminContext();
  if (!gate.ok) return gate.response;
  if (!gate.context.superAdmin) {
    return NextResponse.json({ ok: true, data: { items: [] } });
  }
  const result = await runGraphqlAsUser<{
    audit_logs: { id: string; action: string; entity_type: string; created_at: string }[];
  }>(gate.context.session, ADMIN_QUERIES.alerts, {}, "super_admin");
  if (!result.ok) return disconnectedOrFail(result, { items: [] })!;
  return NextResponse.json({
    ok: true,
    data: {
      items: result.data.audit_logs.map((row) => ({
        id: row.id,
        title: row.action,
        entity: row.entity_type,
        createdAt: row.created_at,
      })),
    },
  });
}
