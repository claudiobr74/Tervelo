import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { NHOST_SESSION_COOKIE } from "@/lib/nhost/config";
import { IDENTITY_COOKIE, isUserId } from "@/lib/auth/identity";
import { ONBOARDING_COOKIE } from "@/lib/auth/onboarding";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { userIdFromAccessTokenPayload } from "@/lib/auth/roles";
import { allowPreviewSessions } from "@/lib/deploy/runtime";
import { clientKeyFromRequest, consumeRateLimit } from "@/lib/security/rate-limit";
import { MAX_SESSION_BODY_BYTES, sanitizeSessionPayload } from "@/lib/security/session-payload";

const SESSION_MAX_AGE = 60 * 60 * 24 * 30;
const IDENTITY_MAX_AGE = SESSION_MAX_AGE;

export async function POST(request: Request) {
  if (consumeRateLimit(`session:${clientKeyFromRequest(request)}`, { max: 120 }) === "limited") {
    return NextResponse.json({ ok: false, error: "too_many_requests" }, { status: 429 });
  }

  const text = await request.text();
  if (text.length > MAX_SESSION_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 });
  }

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const result = sanitizeSessionPayload(raw, { allowPreview: allowPreviewSessions() });
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.reason }, { status: 400 });
  }

  const session = result.session;
  let userId = isUserId(session.user?.id) ? session.user.id : null;

  if (!session.preview) {
    const payload = await verifyAccessToken(session.accessToken);
    if (!payload) {
      return NextResponse.json({ ok: false, error: "invalid_token" }, { status: 401 });
    }
    const claimed = userIdFromAccessTokenPayload(payload);
    if (!isUserId(claimed)) {
      return NextResponse.json({ ok: false, error: "invalid_token" }, { status: 401 });
    }
    userId = claimed;
  }

  const store = await cookies();
  store.set(NHOST_SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  if (userId) {
    store.set(IDENTITY_COOKIE, userId, {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: IDENTITY_MAX_AGE,
    });
  } else {
    store.delete(IDENTITY_COOKIE);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (consumeRateLimit(`session-delete:${clientKeyFromRequest(request)}`, { max: 120 }) === "limited") {
    return NextResponse.json({ ok: false, error: "too_many_requests" }, { status: 429 });
  }
  const store = await cookies();
  store.delete(NHOST_SESSION_COOKIE);
  store.delete(IDENTITY_COOKIE);
  // Onboarding é por conta, não por navegador: deixar o cookie faria o próximo
  // usuário deste dispositivo pular o cadastro inicial.
  store.delete(ONBOARDING_COOKIE);
  return NextResponse.json({ ok: true });
}
