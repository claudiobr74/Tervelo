import { NextResponse } from "next/server";
import { z } from "zod";
import { graphqlFailure, requireAdminContext } from "@/lib/admin/require-session";
import { ADMIN_QUERIES } from "@/lib/admin/queries";
import { AI_CONTRACT_SLUG } from "@/domain/ai/contract-config";
import { runGraphqlAsUser } from "@/lib/nhost/graphql-server";

const bodySchema = z.object({
  versionId: z.string().uuid(),
  environment: z.enum(["testing", "production"]).default("production"),
});

export async function POST(request: Request) {
  const gate = await requireAdminContext();
  if (!gate.ok) return gate.response;
  if (!gate.context.superAdmin) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }
  const loaded = await runGraphqlAsUser<{
    ai_contracts: { id: string }[];
    ai_contract_versions: { id: string; contract_id: string; state: string }[];
  }>(gate.context.session, ADMIN_QUERIES.aiContract, { slug: AI_CONTRACT_SLUG }, "super_admin");
  if (!loaded.ok) return graphqlFailure(loaded.reason);
  const target = loaded.data.ai_contract_versions.find((row) => row.id === parsed.data.versionId);
  if (!target) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  for (const row of loaded.data.ai_contract_versions) {
    if (row.state === "published" && row.id !== target.id) {
      await runGraphqlAsUser(
        gate.context.session,
        ADMIN_QUERIES.updateAiVersionState,
        { id: row.id, state: "archived" },
        "super_admin",
      );
    }
  }
  const published = await runGraphqlAsUser(
    gate.context.session,
    ADMIN_QUERIES.updateAiVersionState,
    { id: target.id, state: "published" },
    "super_admin",
  );
  if (!published.ok) return graphqlFailure(published.reason);
  const publication = await runGraphqlAsUser(
    gate.context.session,
    ADMIN_QUERIES.insertPublication,
    {
      version_id: target.id,
      published_by: gate.context.userId,
      environment: parsed.data.environment,
    },
    "super_admin",
  );
  if (!publication.ok) return graphqlFailure(publication.reason);
  await runGraphqlAsUser(
    gate.context.session,
    ADMIN_QUERIES.insertAudit,
    {
      action: "ai_contract_publish",
      entity_type: "ai_contract_versions",
      entity_id: target.id,
      payload: { environment: parsed.data.environment },
    },
    "super_admin",
  );
  return NextResponse.json({ ok: true, data: publication.data });
}
