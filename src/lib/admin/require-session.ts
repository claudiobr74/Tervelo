import { NextResponse } from "next/server";
import { getServerAppSession } from "@/lib/auth/session";
import {
  sessionHasAdminAccess,
  sessionHasSuperAdminAccess,
  type StoredAppSession,
} from "@/lib/auth/session-cookie";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { userIdFromAccessTokenPayload } from "@/lib/auth/roles";

export type AdminRequestContext = {
  session: StoredAppSession;
  superAdmin: boolean;
  userId: string | null;
};

export async function requireAdminContext(): Promise<
  { ok: true; context: AdminRequestContext } | { ok: false; response: NextResponse }
> {
  const session = await getServerAppSession();
  if (!session || !(await sessionHasAdminAccess(session))) {
    return {
      ok: false,
      response: NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 }),
    };
  }
  const superAdmin = await sessionHasSuperAdminAccess(session);
  let userId = session.user?.id ?? null;
  if (!session.preview) {
    const payload = await verifyAccessToken(session.accessToken);
    userId = payload ? userIdFromAccessTokenPayload(payload) : userId;
  }
  return { ok: true, context: { session, superAdmin, userId } };
}

export function graphqlFailure(
  reason: "nhost_unavailable" | "nhost_unreachable" | "graphql_error",
) {
  const status = reason === "nhost_unavailable" ? 503 : 502;
  return NextResponse.json({ ok: false, error: reason }, { status });
}

/** GET: lista vazia honesta no preview. Mutações continuam falhando via graphqlFailure. */
export function disconnectedOrFail<T>(
  result:
    | { ok: true }
    | { ok: false; reason: "nhost_unavailable" | "nhost_unreachable" | "graphql_error" },
  empty: T,
): NextResponse | null {
  if (result.ok) return null;
  if (result.reason === "nhost_unavailable") {
    return NextResponse.json({ ok: true, data: empty, disconnected: true });
  }
  return graphqlFailure(result.reason);
}
