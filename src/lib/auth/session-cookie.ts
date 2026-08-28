import { hasAdminAccess, hasSuperAdminAccess, rolesFromAccessTokenPayload } from "@/lib/auth/roles";
import { verifyAccessToken } from "@/lib/auth/jwt";

export type StoredAppSession = {
  accessToken?: string;
  refreshToken?: string;
  preview?: boolean;
  previewRole?: "user" | "admin";
  user?: { id?: string; displayName?: string; email?: string };
};

export function parseSessionCookie(raw: string | undefined | null): StoredAppSession | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAppSession;
  } catch {
    return null;
  }
}

/**
 * Papel de administrador só a partir de um token com assinatura verificada.
 * Sessão de pré-visualização é aceita apenas onde ela pode existir (sem backend real),
 * e quem decide isso é `allowPreviewSessions` na hora de gravar o cookie.
 */
export async function sessionHasAdminAccess(session: StoredAppSession | null): Promise<boolean> {
  if (!session) return false;
  if (session.preview) return session.previewRole === "admin";
  const payload = await verifyAccessToken(session.accessToken);
  if (!payload) return false;
  return hasAdminAccess(rolesFromAccessTokenPayload(payload));
}

export async function sessionHasSuperAdminAccess(
  session: StoredAppSession | null,
): Promise<boolean> {
  if (!session) return false;
  if (session.preview) return false;
  const payload = await verifyAccessToken(session.accessToken);
  if (!payload) return false;
  return hasSuperAdminAccess(rolesFromAccessTokenPayload(payload));
}
