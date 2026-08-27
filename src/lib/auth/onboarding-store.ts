import {
  DEFAULT_ONBOARDING,
  ONBOARDING_STORAGE_KEY,
  type OnboardingDraft,
} from "@/lib/auth/onboarding";
import { currentOfflineUserId } from "@/lib/offline/user-scope";

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedDraft: OnboardingDraft = DEFAULT_ONBOARDING;
let storageListenerBound = false;

function emit() {
  for (const listener of listeners) listener();
}

export function parseOnboardingDraft(raw: string | null): OnboardingDraft {
  if (!raw) return DEFAULT_ONBOARDING;
  try {
    return { ...DEFAULT_ONBOARDING, ...(JSON.parse(raw) as OnboardingDraft) };
  } catch {
    return DEFAULT_ONBOARDING;
  }
}

function scopedKey(): string {
  return `${ONBOARDING_STORAGE_KEY}:${currentOfflineUserId()}`;
}

function bindStorageListener() {
  if (storageListenerBound || typeof window === "undefined") return;
  storageListenerBound = true;
  window.addEventListener("storage", (event) => {
    if (
      event.key !== ONBOARDING_STORAGE_KEY &&
      event.key !== scopedKey() &&
      !event.key?.startsWith(`${ONBOARDING_STORAGE_KEY}:`)
    ) {
      return;
    }
    cachedRaw = null;
    emit();
  });
}

function readRaw(): string | null {
  if (typeof window === "undefined") return null;
  bindStorageListener();
  try {
    const local = window.localStorage.getItem(scopedKey());
    if (local) return local;
    // Chave antiga era global: herdá-la copiaria o cadastro de outra conta.
    window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  } catch {
    /* private mode */
  }
  try {
    const session = window.sessionStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (session) {
      try {
        window.localStorage.setItem(ONBOARDING_STORAGE_KEY, session);
        window.sessionStorage.removeItem(ONBOARDING_STORAGE_KEY);
      } catch {
        return session;
      }
      return session;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function writeRaw(raw: string) {
  try {
    window.localStorage.setItem(scopedKey(), raw);
    window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    window.sessionStorage.removeItem(ONBOARDING_STORAGE_KEY);
    return;
  } catch {
    window.sessionStorage.setItem(ONBOARDING_STORAGE_KEY, raw);
  }
}

export function subscribeOnboarding(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getOnboardingSnapshot(): OnboardingDraft {
  if (typeof window === "undefined") return DEFAULT_ONBOARDING;
  const raw = readRaw();
  if (raw === cachedRaw) return cachedDraft;
  cachedRaw = raw;
  cachedDraft = parseOnboardingDraft(raw);
  return cachedDraft;
}

export function getOnboardingServerSnapshot(): OnboardingDraft {
  return DEFAULT_ONBOARDING;
}

export function patchOnboarding(patch: Partial<OnboardingDraft>) {
  const next = { ...getOnboardingSnapshot(), ...patch };
  const raw = JSON.stringify(next);
  writeRaw(raw);
  cachedRaw = raw;
  cachedDraft = next;
  emit();
}
