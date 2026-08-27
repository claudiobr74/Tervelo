export const PUBLIC_PREFIXES = [
  "/login",
  "/signup",
  "/api/health",
  "/api/auth",
  "/sw.js",
  "/manifest.webmanifest",
] as const;

/** Atalhos internos de pré-visualização: só onde não existe backend real. */
export const DEV_PREFIX = "/dev";

export function isPublicPath(pathname: string, devToolsEnabled = false): boolean {
  if (pathname === "/") return true;
  if (pathname === DEV_PREFIX || pathname.startsWith(`${DEV_PREFIX}/`)) return devToolsEnabled;
  return PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export type AuthContext = {
  hasSession: boolean;
  adminAccess: boolean;
  onboardingDone: boolean;
  devToolsEnabled: boolean;
};

/** Destino relativo ou `null` se a requisição segue. */
export function resolveAuthRedirect(pathname: string, context: AuthContext): string | null {
  const { hasSession, adminAccess, onboardingDone, devToolsEnabled } = context;

  if (pathname === DEV_PREFIX || pathname.startsWith(`${DEV_PREFIX}/`)) {
    return devToolsEnabled ? null : "/";
  }

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
    if (!adminAccess) {
      return "/";
    }
  }

  return null;
}
