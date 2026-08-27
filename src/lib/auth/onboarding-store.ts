import { DEFAULT_ONBOARDING, ONBOARDING_STORAGE_KEY, type OnboardingDraft } from "@/lib/auth/onboarding";

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedDraft: OnboardingDraft = DEFAULT_ONBOARDING;

function emit() {
  for (const listener of listeners) listener();
}

function parse(raw: string | null): OnboardingDraft {
  if (!raw) return DEFAULT_ONBOARDING;
  try {
    return { ...DEFAULT_ONBOARDING, ...(JSON.parse(raw) as OnboardingDraft) };
  } catch {
    return DEFAULT_ONBOARDING;
  }
}

export function subscribeOnboarding(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getOnboardingSnapshot(): OnboardingDraft {
  if (typeof window === "undefined") return DEFAULT_ONBOARDING;
  const raw = window.sessionStorage.getItem(ONBOARDING_STORAGE_KEY);
  if (raw === cachedRaw) return cachedDraft;
  cachedRaw = raw;
  cachedDraft = parse(raw);
  return cachedDraft;
}

export function getOnboardingServerSnapshot(): OnboardingDraft {
  return DEFAULT_ONBOARDING;
}

export function patchOnboarding(patch: Partial<OnboardingDraft>) {
  const next = { ...getOnboardingSnapshot(), ...patch };
  const raw = JSON.stringify(next);
  window.sessionStorage.setItem(ONBOARDING_STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedDraft = next;
  emit();
}
