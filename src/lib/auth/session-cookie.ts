import { hasAdminAccess, rolesFromAccessTokenPayload } from "@/lib/auth/roles";

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

export function payloadFromJwt(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(normalized);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function sessionHasAdminAccess(session: StoredAppSession | null): boolean {
  if (!session) return false;
  if (session.preview) return session.previewRole === "admin";
  if (!session.accessToken || session.accessToken === "preview") return false;
  const payload = payloadFromJwt(session.accessToken);
  if (!payload) return false;
  return hasAdminAccess(rolesFromAccessTokenPayload(payload));
}
