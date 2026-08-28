import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ONBOARDING_COOKIE } from "@/lib/auth/onboarding";
import { NHOST_SESSION_COOKIE } from "@/lib/nhost/config";
import { parseSessionCookie, sessionHasAdminAccess } from "@/lib/auth/session-cookie";
import { clientKeyFromRequest, consumeRateLimit } from "@/lib/security/rate-limit";

const bodySchema = z.object({ done: z.boolean() }).strip();

export async function GET() {
  const store = await cookies();
  const session = parseSessionCookie(store.get(NHOST_SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });
  }
  const admin = await sessionHasAdminAccess(session);
  return NextResponse.json({
    ok: true,
    done: store.get(ONBOARDING_COOKIE)?.value === "done",
    admin,
  });
}

export async function POST(request: Request) {
  if (consumeRateLimit(`onboarding:${clientKeyFromRequest(request)}`, { max: 60 }) === "limited") {
    return NextResponse.json({ ok: false, error: "too_many_requests" }, { status: 429 });
  }

  const store = await cookies();
  const session = parseSessionCookie(store.get(NHOST_SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  if (parsed.data.done) {
    store.set(ONBOARDING_COOKIE, "done", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  } else {
    store.delete(ONBOARDING_COOKIE);
  }
  return NextResponse.json({ ok: true });
}
