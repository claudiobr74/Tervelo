import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { athleteProfileInput, coerceOnboardingAnswers } from "@/domain/athlete/onboarding-profile";
import { canPersistOnboarding, persistOnboardingToNhost } from "@/lib/auth/onboarding-persist";
import { parseSessionCookie } from "@/lib/auth/session-cookie";
import { NHOST_SESSION_COOKIE } from "@/lib/nhost/config";
import { clientKeyFromRequest, consumeRateLimit } from "@/lib/security/rate-limit";

const MAX_BODY_BYTES = 16 * 1024;

export async function POST(request: Request) {
  if (
    consumeRateLimit(`onboarding-profile:${clientKeyFromRequest(request)}`, { max: 30 }) ===
    "limited"
  ) {
    return NextResponse.json({ ok: false, error: "too_many_requests" }, { status: 429 });
  }

  const store = await cookies();
  const session = parseSessionCookie(store.get(NHOST_SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });
  }

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 });
  }

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const input = athleteProfileInput(coerceOnboardingAnswers(raw));

  // Sem backend real, ou com GraphQL fora do ar, o rascunho no aparelho vale.
  // Derrubar o cadastro aqui deixava o atleta preso na última etapa.
  if (!canPersistOnboarding(session)) {
    return NextResponse.json({ ok: true, persisted: false });
  }

  const result = await persistOnboardingToNhost(session, input);
  return NextResponse.json({ ok: true, persisted: result.persisted });
}
