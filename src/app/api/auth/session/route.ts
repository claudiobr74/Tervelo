import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { NHOST_SESSION_COOKIE } from "@/lib/nhost/config";

export async function POST(request: Request) {
  const session = await request.json();
  const store = await cookies();
  store.set(NHOST_SESSION_COOKIE, JSON.stringify(session), {
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
