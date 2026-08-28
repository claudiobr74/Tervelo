import { cookies } from "next/headers";
import { IDENTITY_COOKIE, isUserId } from "@/lib/auth/identity";
import { NHOST_SESSION_COOKIE } from "@/lib/nhost/config";
import type { StoredAppSession } from "@/lib/auth/session-cookie";

const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export async function commitStoredSession(
  session: StoredAppSession,
  userId: string | null,
): Promise<void> {
  const store = await cookies();
  store.set(NHOST_SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  if (userId && isUserId(userId)) {
    store.set(IDENTITY_COOKIE, userId, {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
  } else {
    store.delete(IDENTITY_COOKIE);
  }
}
