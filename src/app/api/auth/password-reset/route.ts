import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidEmail } from "@/lib/auth/password";
import { nhostAuthBaseUrl } from "@/lib/nhost/auth-endpoint";
import { clientKeyFromRequest, consumeRateLimit } from "@/lib/security/rate-limit";

const bodySchema = z.object({ email: z.string() }).strip();

export async function POST(request: Request) {
  if (
    consumeRateLimit(`password-reset:${clientKeyFromRequest(request)}`, { max: 10 }) === "limited"
  ) {
    return NextResponse.json({ ok: true });
  }
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }
  const parsed = bodySchema.safeParse(raw);
  const email = parsed.success ? parsed.data.email.trim() : "";
  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: true });
  }
  const authUrl = nhostAuthBaseUrl();
  if (authUrl) {
    try {
      await fetch(`${authUrl}/user/password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // Resposta genérica — não revela se a conta existe.
    }
  }
  return NextResponse.json({ ok: true });
}
