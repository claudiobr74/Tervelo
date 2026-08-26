import { cookies } from "next/headers";
import { NHOST_SESSION_COOKIE } from "@/lib/nhost/config";
import { ONBOARDING_COOKIE } from "@/lib/auth/onboarding";
import {
  parseSessionCookie,
  sessionHasAdminAccess,
  type StoredAppSession,
} from "@/lib/auth/session-cookie";

export async function getServerAppSession(): Promise<StoredAppSession | null> {
  const store = await cookies();
  return parseSessionCookie(store.get(NHOST_SESSION_COOKIE)?.value);
}

export function isOnboardingCompleteCookie(raw: string | undefined | null): boolean {
  return raw === "done";
}

export {
  parseSessionCookie,
  sessionHasAdminAccess,
  NHOST_SESSION_COOKIE,
  ONBOARDING_COOKIE,
};
export type { StoredAppSession };
