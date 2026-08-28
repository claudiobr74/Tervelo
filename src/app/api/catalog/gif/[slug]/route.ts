import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { getServerAppSession } from "@/lib/auth/session";
import { resolveAuthorizedGifFile } from "@/lib/catalog/authorized-library";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const session = await getServerAppSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });
  }
  const { slug } = await context.params;
  const file = resolveAuthorizedGifFile(slug);
  if (!file) {
    return new NextResponse(null, { status: 404 });
  }
  const info = await stat(file);
  const stream = Readable.toWeb(createReadStream(file));
  return new NextResponse(stream as unknown as BodyInit, {
    headers: {
      "Content-Type": "image/gif",
      "Content-Length": String(info.size),
      "Cache-Control": "private, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
