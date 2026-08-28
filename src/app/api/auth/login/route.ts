import { NextResponse } from "next/server";
import { z } from "zod";
import { commitStoredSession } from "@/lib/auth/commit-session";
import { isUserId } from "@/lib/auth/identity";
import { previewSession } from "@/lib/auth/local-preview";
import { messageFromAuthBody } from "@/lib/auth/nhost-error";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, isValidEmail } from "@/lib/auth/password";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { userIdFromAccessTokenPayload } from "@/lib/auth/roles";
import { allowPreviewSessions } from "@/lib/deploy/runtime";
import { nhostAuthBaseUrl } from "@/lib/nhost/auth-endpoint";
import { clientKeyFromRequest, consumeRateLimit } from "@/lib/security/rate-limit";
import { sanitizeSessionPayload } from "@/lib/security/session-payload";

const bodySchema = z.object({ email: z.string(), password: z.string() }).strip();

export async function POST(request: Request) {
  if (consumeRateLimit(`login:${clientKeyFromRequest(request)}`, { max: 40 }) === "limited") {
    return NextResponse.json(
      { ok: false, error: "Muitas tentativas. Aguarde um instante." },
      { status: 429 },
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Pedido inválido." }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Pedido inválido." }, { status: 400 });
  }
  const email = parsed.data.email.trim();
  const password = parsed.data.password;
  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, error: "Informe um e-mail válido." }, { status: 400 });
  }
  if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
    return NextResponse.json(
      { ok: false, error: `A senha precisa ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.` },
      { status: 400 },
    );
  }

  const authUrl = nhostAuthBaseUrl();
  if (!authUrl) {
    if (!allowPreviewSessions()) {
      return NextResponse.json(
        { ok: false, error: "O login precisa do Nhost configurado neste ambiente." },
        { status: 503 },
      );
    }
    const session = previewSession({ email });
    await commitStoredSession(session, session.user?.id ?? null);
    return NextResponse.json({ ok: true });
  }

  let response: Response;
  try {
    response = await fetch(`${authUrl}/signin/email-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "O Auth não respondeu. Tente de novo." },
      { status: 502 },
    );
  }
  const payload = (await response.json().catch(() => null)) as { session?: unknown } | null;
  if (!response.ok || !payload?.session) {
    return NextResponse.json(
      { ok: false, error: messageFromAuthBody(payload ?? { message: "unverified" }) },
      { status: response.ok ? 401 : response.status === 429 ? 429 : 401 },
    );
  }
  const sanitized = sanitizeSessionPayload(payload.session, { allowPreview: false });
  if (!sanitized.ok) {
    return NextResponse.json(
      { ok: false, error: "A sessão devolvida pelo Auth não pôde ser gravada." },
      { status: 502 },
    );
  }
  const tokenPayload = await verifyAccessToken(sanitized.session.accessToken);
  const claimed = tokenPayload ? userIdFromAccessTokenPayload(tokenPayload) : null;
  if (!tokenPayload || !isUserId(claimed)) {
    return NextResponse.json(
      { ok: false, error: "A sessão do Auth não passou na verificação JWT." },
      { status: 401 },
    );
  }
  await commitStoredSession(sanitized.session, claimed);
  return NextResponse.json({ ok: true });
}
