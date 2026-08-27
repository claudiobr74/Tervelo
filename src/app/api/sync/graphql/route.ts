import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { NHOST_SESSION_COOKIE, getNhostPublicConfig } from "@/lib/nhost/config";
import { parseSessionCookie } from "@/lib/auth/session-cookie";
import { clientKeyFromRequest, consumeRateLimit } from "@/lib/security/rate-limit";

/**
 * Ponte de sincronização. O token de acesso vive num cookie `httpOnly`, então o
 * navegador não consegue montar o header `Authorization` sozinho: esta rota lê o
 * cookie no servidor e repassa a operação ao Hasura com a identidade do usuário.
 * As permissões continuam sendo decididas pelo Hasura, não aqui.
 */
const MAX_BODY_BYTES = 256 * 1024;

const bodySchema = z
  .object({
    query: z.string().min(1).max(20_000),
    variables: z.record(z.string(), z.unknown()).optional(),
  })
  .strip();

function graphqlEndpoint(): string | null {
  const { subdomain, region } = getNhostPublicConfig();
  if (subdomain === "local") return null;
  return `https://${subdomain}.graphql.${region}.nhost.run/v1`;
}

export async function POST(request: Request) {
  if (consumeRateLimit(`sync:${clientKeyFromRequest(request)}`, { max: 600 }) === "limited") {
    return NextResponse.json({ ok: false, error: "too_many_requests" }, { status: 429 });
  }

  const store = await cookies();
  const session = parseSessionCookie(store.get(NHOST_SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });
  }

  const endpoint = graphqlEndpoint();
  if (!endpoint || session.preview || !session.accessToken || session.accessToken === "preview") {
    return NextResponse.json({ ok: false, error: "nhost_unavailable" }, { status: 503 });
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

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({ query: parsed.data.query, variables: parsed.data.variables ?? {} }),
    });
  } catch {
    return NextResponse.json({ ok: false, error: "nhost_unreachable" }, { status: 502 });
  }

  const payload = await upstream.text();
  return new NextResponse(payload, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}
