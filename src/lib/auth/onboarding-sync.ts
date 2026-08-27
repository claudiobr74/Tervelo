import type { OnboardingDraft } from "@/lib/auth/onboarding";

export type OnboardingSaveResult = { ok: true; persisted: boolean } | { ok: false };

/**
 * Envia as respostas do onboarding para o servidor. Em pré-visualização não há
 * backend para guardar nada, e a resposta diz isso em vez de fingir que salvou.
 */
export async function saveOnboardingProfile(draft: OnboardingDraft): Promise<OnboardingSaveResult> {
  try {
    const response = await fetch("/api/onboarding/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: draft.displayName,
        sex: draft.sex,
        birthDate: draft.birthDate,
        heightCm: draft.heightCm,
        weightKg: draft.weightKg,
        experience: draft.experience,
        comfortableFreeWeights: draft.comfortableFreeWeights,
        comfortableMachines: draft.comfortableMachines,
        limitations: draft.limitations,
        goal: draft.goal,
        days: draft.days,
        sessionMinutes: draft.sessionMinutes,
        mealsPerDay: draft.mealsPerDay,
        dietPattern: draft.dietPattern,
        waterLiters: draft.waterLiters,
        usesSupplements: draft.usesSupplements,
        supplements: draft.supplements,
        preferredPeriod: draft.preferredPeriod,
      }),
    });
    if (!response.ok) return { ok: false };
    const body = (await response.json()) as { persisted?: boolean };
    return { ok: true, persisted: Boolean(body.persisted) };
  } catch {
    return { ok: false };
  }
}

/** Destino após entrar: quem já respondeu o cadastro inicial não deve revê-lo. */
export async function onboardingLandingPath(): Promise<string> {
  try {
    const response = await fetch("/api/auth/onboarding", { method: "GET" });
    if (!response.ok) return "/onboarding/perfil";
    const body = (await response.json()) as { done?: boolean };
    return body.done ? "/app/today" : "/onboarding/perfil";
  } catch {
    return "/onboarding/perfil";
  }
}

export async function markOnboardingComplete(): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: true }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
