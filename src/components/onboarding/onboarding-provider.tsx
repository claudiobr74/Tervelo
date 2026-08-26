"use client";

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import type { OnboardingDraft } from "@/lib/auth/onboarding";
import {
  getOnboardingServerSnapshot,
  getOnboardingSnapshot,
  patchOnboarding,
  subscribeOnboarding,
} from "@/lib/auth/onboarding-store";

type OnboardingContextValue = {
  draft: OnboardingDraft;
  update: (patch: Partial<OnboardingDraft>) => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const draft = useSyncExternalStore(
    subscribeOnboarding,
    getOnboardingSnapshot,
    getOnboardingServerSnapshot,
  );
  const value = useMemo(
    () => ({
      draft,
      update: patchOnboarding,
    }),
    [draft],
  );
  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding precisa do OnboardingProvider");
  }
  return context;
}
