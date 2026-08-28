import { getNhostPublicConfig } from "@/lib/nhost/config";
import type { StoredAppSession } from "@/lib/auth/session-cookie";

export type GraphqlOutcome<T> =
  | { ok: true; data: T }
  | { ok: false; reason: "nhost_unavailable" | "nhost_unreachable" | "graphql_error" };

export function nhostGraphqlEndpoint(): string | null {
  const { subdomain, region } = getNhostPublicConfig();
  if (subdomain === "local") return null;
  return `https://${subdomain}.graphql.${region}.nhost.run/v1`;
}

export function nhostStorageEndpoint(): string | null {
  const { subdomain, region } = getNhostPublicConfig();
  if (subdomain === "local") return null;
  return `https://${subdomain}.storage.${region}.nhost.run/v1`;
}

/** Sessão utilizável para falar com o Hasura em nome do usuário. */
export function sessionCanReachNhost(
  session: StoredAppSession | null,
): session is StoredAppSession {
  return Boolean(
    session && !session.preview && session.accessToken && session.accessToken !== "preview",
  );
}

async function postGraphql<T>(
  headers: Record<string, string>,
  query: string,
  variables: Record<string, unknown>,
): Promise<GraphqlOutcome<T>> {
  const endpoint = nhostGraphqlEndpoint();
  if (!endpoint) {
    return { ok: false, reason: "nhost_unavailable" };
  }
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
    });
  } catch {
    return { ok: false, reason: "nhost_unreachable" };
  }
  if (!response.ok) {
    return { ok: false, reason: "graphql_error" };
  }
  const json = (await response.json()) as { data?: T; errors?: { message?: string }[] };
  if (json.errors?.length || !json.data) {
    const messages = (json.errors ?? [])
      .map((error) => error.message)
      .filter((message): message is string => Boolean(message))
      .slice(0, 3);
    if (messages.length > 0) {
      console.warn("[graphql]", messages.join("; "));
    }
    return { ok: false, reason: "graphql_error" };
  }
  return { ok: true, data: json.data };
}

export async function runGraphqlAsUser<T>(
  session: StoredAppSession | null,
  query: string,
  variables: Record<string, unknown>,
  role?: "admin" | "super_admin",
): Promise<GraphqlOutcome<T>> {
  if (!sessionCanReachNhost(session)) {
    return { ok: false, reason: "nhost_unavailable" };
  }
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.accessToken}`,
  };
  if (role) headers["x-hasura-role"] = role;
  return postGraphql<T>(headers, query, variables);
}

export async function runGraphqlWithAdminSecret<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<GraphqlOutcome<T>> {
  const secret = process.env.NHOST_ADMIN_SECRET;
  if (!secret) {
    return { ok: false, reason: "nhost_unavailable" };
  }
  return postGraphql<T>(
    {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": secret,
    },
    query,
    variables,
  );
}

/** Catálogo: JWT do atleta, ou admin secret no servidor se a sessão for de preview. */
export async function runGraphqlForCatalog<T>(
  session: StoredAppSession | null,
  query: string,
  variables: Record<string, unknown>,
): Promise<GraphqlOutcome<T>> {
  const asUser = await runGraphqlAsUser<T>(session, query, variables);
  if (asUser.ok) return asUser;
  return runGraphqlWithAdminSecret<T>(query, variables);
}

export function storageAuthHeaders(session: StoredAppSession | null): Record<string, string>[] {
  const attempts: Record<string, string>[] = [];
  if (sessionCanReachNhost(session)) {
    attempts.push({ Authorization: `Bearer ${session.accessToken}` });
  }
  const secret = process.env.NHOST_ADMIN_SECRET;
  if (secret) {
    attempts.push({ "x-hasura-admin-secret": secret });
  }
  return attempts;
}
