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

/** Sessão utilizável para falar com o Hasura em nome do usuário. */
export function sessionCanReachNhost(
  session: StoredAppSession | null,
): session is StoredAppSession {
  return Boolean(
    session && !session.preview && session.accessToken && session.accessToken !== "preview",
  );
}

export async function runGraphqlAsUser<T>(
  session: StoredAppSession | null,
  query: string,
  variables: Record<string, unknown>,
  role?: "admin" | "super_admin",
): Promise<GraphqlOutcome<T>> {
  const endpoint = nhostGraphqlEndpoint();
  if (!endpoint || !sessionCanReachNhost(session)) {
    return { ok: false, reason: "nhost_unavailable" };
  }
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.accessToken}`,
  };
  if (role) headers["x-hasura-role"] = role;
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
