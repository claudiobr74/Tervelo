import { NextResponse } from "next/server";
import { getServerAppSession } from "@/lib/auth/session";
import type { StoredAppSession } from "@/lib/auth/session-cookie";

export async function requireAthleteSession(): Promise<
  { ok: true; session: StoredAppSession } | { ok: false; response: NextResponse }
> {
  const session = await getServerAppSession();
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 }),
    };
  }
  return { ok: true, session };
}
