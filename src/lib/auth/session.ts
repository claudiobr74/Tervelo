import { cookies } from "next/headers";
import { NHOST_SESSION_COOKIE } from "@/lib/nhost/config";
import { ONBOARDING_COOKIE } from "@/lib/auth/onboarding";

export type StoredAppSession = {
  accessToken?: string;
  refreshToken?: string;
  preview?: boolean;
  user?: { id?: string; displayName?: string; email?: string };
};

export function parseSessionCookie(raw: string | undefined | null): StoredAppSession | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAppSession;
  } catch {
    return null;
  }
}

export async function getServerAppSession(): Promise<StoredAppSession | null> {
  const store = await cookies();
  return parseSessionCookie(store.get(NHOST_SESSION_COOKIE)?.value);
}

export function isOnboardingCompleteCookie(raw: string | undefined | null): boolean {
  return raw === "done";
}

export { NHOST_SESSION_COOKIE, ONBOARDING_COOKIE };
