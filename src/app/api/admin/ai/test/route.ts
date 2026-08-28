import { NextResponse } from "next/server";
import { graphqlFailure, requireAdminContext } from "@/lib/admin/require-session";
import { ADMIN_QUERIES } from "@/lib/admin/queries";
import {
  AI_CONTRACT_SLUG,
  aiContractConfigSchema,
  parseAiContractConfig,
  testAiContract,
} from "@/domain/ai/contract-config";
import { runGraphqlAsUser } from "@/lib/nhost/graphql-server";

export async function POST(request: Request) {
  const gate = await requireAdminContext();
  if (!gate.ok) return gate.response;
  const body = (await request.json().catch(() => null)) as { config?: unknown } | null;
  const parsed = body?.config ? aiContractConfigSchema.safeParse(body.config) : null;
  const loaded = await runGraphqlAsUser<{
    ai_contract_versions: {
      id: string;
      contract_id: string;
      version: number;
      state: string;
      config: unknown;
    }[];
    ai_contracts: { id: string }[];
  }>(
    gate.context.session,
    ADMIN_QUERIES.aiContract,
    { slug: AI_CONTRACT_SLUG },
    gate.context.superAdmin ? "super_admin" : "admin",
  );
  const dbConfig = loaded.ok
    ? (loaded.data.ai_contract_versions.find((row) => row.state === "published")?.config ??
      loaded.data.ai_contract_versions[0]?.config)
    : null;
  const config = parsed?.success ? parsed.data : parseAiContractConfig(dbConfig);
  const evaluation = testAiContract(config);
  if (gate.context.superAdmin && gate.context.userId && loaded.ok) {
    const versionId =
      loaded.data.ai_contract_versions.find((row) => row.state === "published")?.id ??
      loaded.data.ai_contract_versions[0]?.id ??
      null;
    await runGraphqlAsUser(
      gate.context.session,
      ADMIN_QUERIES.insertAiRun,
      {
        user_id: gate.context.userId,
        contract_version_id: versionId,
        model: config.models.primary,
        status: "tested",
        input_context_snapshot: {
          kind: "admin_dry_run",
          athleteFacts: evaluation.athleteFacts,
          missingFields: evaluation.missingFields,
        },
      },
      "super_admin",
    );
    await runGraphqlAsUser(
      gate.context.session,
      ADMIN_QUERIES.insertAudit,
      {
        action: "ai_contract_test",
        entity_type: "ai_runs",
        entity_id: versionId,
        payload: evaluation,
      },
      "super_admin",
    );
  } else if (!loaded.ok && loaded.reason !== "nhost_unavailable") {
    return graphqlFailure(loaded.reason);
  }
  return NextResponse.json({
    ok: true,
    data: {
      ...evaluation,
      persisted: Boolean(gate.context.superAdmin && loaded.ok),
    },
  });
}
