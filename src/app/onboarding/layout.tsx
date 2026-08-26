import type { ReactNode } from "react";
import { OnboardingProvider } from "@/components/onboarding/onboarding-provider";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return <OnboardingProvider>{children}</OnboardingProvider>;
}
