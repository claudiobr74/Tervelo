import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { getServerAppSession } from "@/lib/auth/session";
import { authorizedGifObjectKey, resolveAuthorizedGifFile } from "@/lib/catalog/authorized-library";
import { fetchAuthorizedGifFromNhost } from "@/lib/catalog/gif-from-nhost";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function gifHeaders(extra: Record<string, string> = {}) {
  return {
    "Content-Type": "image/gif",
    "Cache-Control": "private, max-age=86400",
    "X-Content-Type-Options": "nosniff",
    ...extra,
  };
}

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const session = await getServerAppSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });
  }
  const { slug } = await context.params;
  const file = resolveAuthorizedGifFile(slug);
  if (file) {
    const info = await stat(file);
    const stream = Readable.toWeb(createReadStream(file));
    return new NextResponse(stream as unknown as BodyInit, {
      headers: gifHeaders({ "Content-Length": String(info.size) }),
    });
  }
  const objectKey = authorizedGifObjectKey(slug);
  if (objectKey) {
    const remote = await fetchAuthorizedGifFromNhost(session, objectKey);
    if (remote?.body) {
      const length = remote.headers.get("content-length");
      const type = remote.headers.get("content-type");
      return new NextResponse(remote.body, {
        headers: gifHeaders({
          ...(type ? { "Content-Type": type } : {}),
          ...(length ? { "Content-Length": length } : {}),
        }),
      });
    }
  }
  return new NextResponse(null, { status: 404 });
}
