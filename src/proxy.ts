import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { NHOST_SESSION_COOKIE } from "@/lib/nhost/config";
import { ONBOARDING_COOKIE } from "@/lib/auth/onboarding";
import { parseSessionCookie, sessionHasAdminAccess } from "@/lib/auth/session-cookie";
import { resolveAuthRedirect } from "@/lib/auth/proxy-guard";
import { devToolsEnabled } from "@/lib/deploy/runtime";
import { NONCE_HEADER, securityHeaders } from "@/lib/security/headers";

function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

function withSecurityHeaders(response: NextResponse, nonce: string): NextResponse {
  for (const [key, value] of Object.entries(securityHeaders(nonce))) {
    response.headers.set(key, value);
  }
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const nonce = createNonce();
  const rawSession = request.cookies.get(NHOST_SESSION_COOKIE)?.value;
  const session = parseSessionCookie(rawSession);
  const hasSession = session != null;
  const onboardingDone = request.cookies.get(ONBOARDING_COOKIE)?.value === "done";

  // A verificação de assinatura custa uma chamada ao JWKS; só o console admin precisa dela.
  const adminAccess = pathname.startsWith("/admin") ? await sessionHasAdminAccess(session) : false;

  const dest = resolveAuthRedirect(pathname, {
    hasSession,
    adminAccess,
    onboardingDone,
    devToolsEnabled: devToolsEnabled(),
  });
  if (dest) {
    return withSecurityHeaders(NextResponse.redirect(new URL(dest, request.url)), nonce);
  }

  const headers = new Headers(request.headers);
  headers.set(NONCE_HEADER, nonce);
  return withSecurityHeaders(NextResponse.next({ request: { headers } }), nonce);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|brand/|icons/|catalog/|sw\\.js|manifest\\.webmanifest).*)",
  ],
};
