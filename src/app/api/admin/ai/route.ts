import { NextResponse } from "next/server";
import { z } from "zod";
import {
  disconnectedOrFail,
  graphqlFailure,
  requireAdminContext,
} from "@/lib/admin/require-session";
import { ADMIN_QUERIES } from "@/lib/admin/queries";
import {
  AI_CONTRACT_SLUG,
  DEFAULT_AI_CONTRACT_CONFIG,
  aiContractConfigSchema,
  parseAiContractConfig,
  type AiContractConfig,
} from "@/domain/ai/contract-config";
import { runGraphqlAsUser } from "@/lib/nhost/graphql-server";

type VersionRow = {
  id: string;
  contract_id: string;
  version: number;
  state: string;
  config: unknown;
  change_summary: string | null;
  author_user_id: string | null;
  created_at: string;
};

type ContractRow = { id: string; slug: string; created_at: string };

function emptyAiPayload(superAdmin: boolean) {
  return {
    slug: AI_CONTRACT_SLUG,
    contractId: null as string | null,
    superAdmin,
    fromDatabase: false,
    config: DEFAULT_AI_CONTRACT_CONFIG,
    latest: null as { id: string; version: number; state: string; createdAt: string } | null,
    published: null as { id: string; version: number; state: string; createdAt: string } | null,
    versions: [] as {
      id: string;
      version: number;
      state: string;
      changeSummary: string | null;
      createdAt: string;
      config: AiContractConfig;
    }[],
  };
}

async function loadContract(
  session: Parameters<typeof runGraphqlAsUser>[0],
  role: "admin" | "super_admin",
) {
  return runGraphqlAsUser<{
    ai_contracts: ContractRow[];
    ai_contract_versions: VersionRow[];
  }>(session, ADMIN_QUERIES.aiContract, { slug: AI_CONTRACT_SLUG }, role);
}

function serializeContract(
  superAdmin: boolean,
  contract: ContractRow | null,
  versions: VersionRow[],
) {
  const latest = versions[0] ?? null;
  const published = versions.find((row) => row.state === "published") ?? null;
  const config = parseAiContractConfig(
    latest?.config ?? published?.config ?? DEFAULT_AI_CONTRACT_CONFIG,
  );
  return {
    slug: AI_CONTRACT_SLUG,
    contractId: contract?.id ?? null,
    superAdmin,
    fromDatabase: versions.length > 0,
    config,
    latest: latest
      ? {
          id: latest.id,
          version: latest.version,
          state: latest.state,
          createdAt: latest.created_at,
        }
      : null,
    published: published
      ? {
          id: published.id,
          version: published.version,
          state: published.state,
          createdAt: published.created_at,
        }
      : null,
    versions: versions.map((row) => ({
      id: row.id,
      version: row.version,
      state: row.state,
      changeSummary: row.change_summary,
      createdAt: row.created_at,
      config: parseAiContractConfig(row.config),
    })),
  };
}

export async function GET() {
  const gate = await requireAdminContext();
  if (!gate.ok) return gate.response;
  const role = gate.context.superAdmin ? "super_admin" : "admin";
  const result = await loadContract(gate.context.session, role);
  if (!result.ok) return disconnectedOrFail(result, emptyAiPayload(gate.context.superAdmin))!;
  const contract = result.data.ai_contracts[0] ?? null;
  const versions = result.data.ai_contract_versions.filter(
    (row) => !contract || row.contract_id === contract.id,
  );
  return NextResponse.json({
    ok: true,
    data: serializeContract(gate.context.superAdmin, contract, versions),
  });
}

const saveSchema = z.object({
  config: aiContractConfigSchema,
  changeSummary: z.string().trim().max(500).optional(),
});

export async function POST(request: Request) {
  const gate = await requireAdminContext();
  if (!gate.ok) return gate.response;
  if (!gate.context.superAdmin) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const parsed = saveSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }
  const loaded = await loadContract(gate.context.session, "super_admin");
  if (!loaded.ok) return graphqlFailure(loaded.reason);
  let contract: ContractRow | null = loaded.data.ai_contracts[0] ?? null;
  if (!contract) {
    const created = await runGraphqlAsUser<{
      insert_ai_contracts_one: ContractRow | null;
    }>(
      gate.context.session,
      ADMIN_QUERIES.insertAiContract,
      { slug: AI_CONTRACT_SLUG },
      "super_admin",
    );
    if (!created.ok) return graphqlFailure(created.reason);
    contract = created.data.insert_ai_contracts_one;
  }
  if (!contract) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  const versions = loaded.data.ai_contract_versions.filter(
    (row) => row.contract_id === contract.id,
  );
  const nextVersion = (versions[0]?.version ?? 0) + 1;
  const inserted = await runGraphqlAsUser<{
    insert_ai_contract_versions_one: {
      id: string;
      version: number;
      state: string;
      created_at: string;
    } | null;
  }>(
    gate.context.session,
    ADMIN_QUERIES.insertAiVersion,
    {
      contract_id: contract.id,
      version: nextVersion,
      author_user_id: gate.context.userId,
      state: "draft",
      config: parsed.data.config,
      change_summary: parsed.data.changeSummary ?? "Rascunho do contrato",
    },
    "super_admin",
  );
  if (!inserted.ok) return graphqlFailure(inserted.reason);
  await runGraphqlAsUser(
    gate.context.session,
    ADMIN_QUERIES.insertAudit,
    {
      action: "ai_contract_draft",
      entity_type: "ai_contract_versions",
      entity_id: inserted.data.insert_ai_contract_versions_one?.id,
      payload: { version: nextVersion, slug: AI_CONTRACT_SLUG },
    },
    "super_admin",
  );
  return NextResponse.json({ ok: true, data: inserted.data });
}

export type { AiContractConfig };
