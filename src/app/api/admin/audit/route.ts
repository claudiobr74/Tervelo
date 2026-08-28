import { NextResponse } from "next/server";
import { disconnectedOrFail, requireAdminContext } from "@/lib/admin/require-session";
import { ADMIN_QUERIES } from "@/lib/admin/queries";
import { runGraphqlAsUser } from "@/lib/nhost/graphql-server";

export async function GET() {
  const gate = await requireAdminContext();
  if (!gate.ok) return gate.response;
  if (!gate.context.superAdmin) {
    return NextResponse.json({
      ok: true,
      data: { audit_logs: [], ai_decisions: [], requiresSuperAdmin: true },
    });
  }
  const result = await runGraphqlAsUser<{
    audit_logs: {
      id: string;
      actor_user_id: string | null;
      action: string;
      entity_type: string;
      entity_id: string | null;
      payload: unknown;
      created_at: string;
    }[];
    ai_decisions: {
      id: string;
      user_id: string;
      agent: string;
      action: string | null;
      rationale: string | null;
      created_at: string;
      accepted: boolean | null;
      overridden: boolean;
    }[];
  }>(gate.context.session, ADMIN_QUERIES.audit, {}, "super_admin");
  if (!result.ok) {
    return disconnectedOrFail(result, {
      audit_logs: [],
      ai_decisions: [],
      requiresSuperAdmin: false,
    })!;
  }
  return NextResponse.json({ ok: true, data: { ...result.data, requiresSuperAdmin: false } });
}
