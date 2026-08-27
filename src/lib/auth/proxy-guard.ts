import { sessionHasAdminAccess, type StoredAppSession } from "@/lib/auth/session-cookie";

export const PUBLIC_PREFIXES = [
  "/login",
  "/signup",
  "/dev",
  "/api/health",
  "/api/auth",
  "/sw.js",
  "/manifest.webmanifest",
] as const;

export function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/** Destino relativo ou `null` se a requisição segue. */
export function resolveAuthRedirect(
  pathname: string,
  session: StoredAppSession | null,
  hasSession: boolean,
  onboardingDone: boolean,
): string | null {
  if ((pathname === "/login" || pathname === "/signup") && hasSession) {
    return onboardingDone ? "/app/today" : "/onboarding/perfil";
  }

  if (pathname.startsWith("/onboarding")) {
    if (!hasSession) return "/login";
    if (onboardingDone) return "/app/today";
  }

  if (pathname.startsWith("/app") && !hasSession) {
    return "/login";
  }

  if (pathname.startsWith("/admin")) {
    if (!hasSession) {
      return "/login";
    }
    if (!sessionHasAdminAccess(session)) {
      return "/";
    }
  }

  return null;
}
