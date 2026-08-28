export type AdminApiError =
  | "forbidden"
  | "nhost_unavailable"
  | "nhost_unreachable"
  | "graphql_error"
  | "invalid_payload"
  | "not_found";

export type AdminApiResult<T> =
  { ok: true; data: T; disconnected?: boolean } | { ok: false; error: string };

export async function adminRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<AdminApiResult<T>> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const json = (await response.json().catch(() => null)) as AdminApiResult<T> | null;
  if (!json) return { ok: false, error: "graphql_error" };
  return json;
}
