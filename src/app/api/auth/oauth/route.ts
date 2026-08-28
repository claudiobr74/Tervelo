import { NextResponse } from "next/server";
import { z } from "zod";
import { nhostAuthBaseUrl } from "@/lib/nhost/auth-endpoint";
import { clientKeyFromRequest, consumeRateLimit } from "@/lib/security/rate-limit";

const schema = z.object({
  provider: z.enum(["google", "apple"]),
  redirectTo: z.string().optional(),
});

export async function POST(request: Request) {
  if (consumeRateLimit(`oauth:${clientKeyFromRequest(request)}`, { max: 20 }) === "limited") {
    return NextResponse.json(
      { ok: false, error: "Muitas tentativas. Aguarde um instante." },
      { status: 429 },
    );
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Pedido inválido." }, { status: 400 });
  }
  const authUrl = nhostAuthBaseUrl();
  if (!authUrl) {
    return NextResponse.json(
      {
        ok: false,
        error: `Login com ${parsed.data.provider === "google" ? "Google" : "Apple"} precisa do Nhost neste ambiente. Use e-mail e senha.`,
      },
      { status: 503 },
    );
  }
  const origin = new URL(request.url).origin;
  const redirectTo = parsed.data.redirectTo?.startsWith("/")
    ? `${origin}${parsed.data.redirectTo}`
    : `${origin}/app/today`;
  const url = `${authUrl}/signin/provider/${parsed.data.provider}?redirectTo=${encodeURIComponent(redirectTo)}`;
  return NextResponse.json({ ok: true, redirect: url });
}
