import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { NHOST_SESSION_COOKIE } from "@/lib/nhost/config";
import { ONBOARDING_COOKIE } from "@/lib/auth/onboarding";

const PUBLIC_PREFIXES = ["/login", "/signup", "/dev", "/api/health", "/api/auth"];

function isPublic(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(NHOST_SESSION_COOKIE)?.value);
  const onboardingDone = request.cookies.get(ONBOARDING_COOKIE)?.value === "done";

  if ((pathname === "/login" || pathname === "/signup") && hasSession) {
    const dest = onboardingDone ? "/" : "/onboarding/perfil";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  if (pathname.startsWith("/onboarding") && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/app") && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/admin") && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!isPublic(pathname) && pathname.startsWith("/onboarding") === false) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand/|icons/).*)"],
};
