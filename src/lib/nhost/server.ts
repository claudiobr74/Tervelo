import "server-only";

import { createServerClient, type StoredSession } from "@nhost/nhost-js";
import { NHOST_SESSION_COOKIE, getNhostPublicConfig } from "@/lib/nhost/config";

type CookieReader = {
  get: (name: string) => { value: string } | undefined;
  set: (name: string, value: string) => void;
  delete: (name: string) => void;
};

function parseSession(raw: string | undefined | null): StoredSession | null {
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

/** Cliente de Server Components com sessão em cookie. Sem admin secret. */
export function createNhostServerClient(cookieStore: CookieReader) {
  const { subdomain, region } = getNhostPublicConfig();

  return createServerClient({
    subdomain,
    region,
    storage: {
      get: (): StoredSession | null => parseSession(cookieStore.get(NHOST_SESSION_COOKIE)?.value),
      set: (value: StoredSession) => {
        cookieStore.set(NHOST_SESSION_COOKIE, JSON.stringify(value));
      },
      remove: () => {
        cookieStore.delete(NHOST_SESSION_COOKIE);
      },
    },
  });
}
