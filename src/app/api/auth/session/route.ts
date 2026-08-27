import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { NHOST_SESSION_COOKIE } from "@/lib/nhost/config";
import { clientKeyFromRequest, consumeRateLimit } from "@/lib/security/rate-limit";
import {
  allowPreviewSessions,
  MAX_SESSION_BODY_BYTES,
  sanitizeSessionPayload,
} from "@/lib/security/session-payload";

export async function POST(request: Request) {
  if (consumeRateLimit(`session:${clientKeyFromRequest(request)}`) === "limited") {
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

  const store = await cookies();
  store.set(NHOST_SESSION_COOKIE, JSON.stringify(result.session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const store = await cookies();
  store.delete(NHOST_SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
