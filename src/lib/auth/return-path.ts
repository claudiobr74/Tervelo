const ALLOWED = [
  /^\/admin(?:\/[a-z0-9/_-]*)?$/i,
  /^\/app(?:\/[a-z0-9/_-]*)?$/,
  /^\/onboarding(?:\/[a-z0-9/_-]*)?$/,
];

/** Só caminhos internos do app. Bloqueia `//`, hosts e querystring. */
export function safeReturnPath(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let path = raw.trim();
  if (!path) return null;
  try {
    if (/^https?:\/\//i.test(path)) {
      path = new URL(path).pathname;
    }
  } catch {
    return null;
  }
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\") || path.includes("@")) {
    return null;
  }
  const pathname = path.split("?")[0].split("#")[0];
  if (pathname.length > 200) return null;
  if (!ALLOWED.some((pattern) => pattern.test(pathname))) return null;
  return pathname;
}

export function loginPathWithNext(pathname: string): string {
  const next = safeReturnPath(pathname);
  if (!next || !next.startsWith("/admin")) return "/login";
  return `/login?next=${encodeURIComponent(next)}`;
}

export function resolvePostLoginPath(input: {
  admin: boolean;
  onboardingDone: boolean;
  next?: string | null;
}): string {
  const next = safeReturnPath(input.next);
  if (next?.startsWith("/admin")) {
    return input.admin ? next : input.onboardingDone ? "/app/today" : "/onboarding/perfil";
  }
  if (next) return next;
  if (input.admin) return "/admin";
  return input.onboardingDone ? "/app/today" : "/onboarding/perfil";
}
