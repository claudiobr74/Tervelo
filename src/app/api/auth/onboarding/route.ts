import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ONBOARDING_COOKIE } from "@/lib/auth/onboarding";

export async function POST(request: Request) {
  const body = (await request.json()) as { done?: boolean };
  const store = await cookies();
  if (body.done) {
    store.set(ONBOARDING_COOKIE, "done", {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  } else {
    store.delete(ONBOARDING_COOKIE);
  }
  return NextResponse.json({ ok: true });
}
