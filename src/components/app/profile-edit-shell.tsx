"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { AthleteAppShell } from "@/components/app/athlete-shell";
import { PRIMARY_CTA_CLASS } from "@/components/auth/auth-shell";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { useOnboardingDraft } from "@/components/onboarding/onboarding-provider";
import { saveOnboardingProfile } from "@/lib/auth/onboarding-sync";

export function ProfileEditShell({
  title,
  children,
  saveLabel = "Salvar",
}: {
  title: string;
  children: ReactNode;
  saveLabel?: string;
}) {
  const router = useRouter();
  const { draft } = useOnboardingDraft();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    const result = await saveOnboardingProfile(draft);
    setSaving(false);
    if (!result.ok) {
      setError("Não foi possível salvar agora. Suas respostas continuam neste aparelho.");
      return;
    }
    router.push("/app/profile");
  }

  return (
    <AthleteAppShell active="Mais">
      <div className="flex flex-col gap-5 px-6 pb-8 pt-4">
        <div className="flex items-center gap-3">
          <Link href="/app/profile" aria-label="Voltar" className="text-foreground">
            <FigmaIcon src="/icons/arrow-left.svg" alt="" size={24} />
          </Link>
          <h1 className="text-xl font-extrabold text-foreground">{title}</h1>
        </div>
        {children}
        {error ? <p className="text-sm text-error">{error}</p> : null}
        <button type="button" onClick={save} disabled={saving} className={PRIMARY_CTA_CLASS}>
          {saving ? "Salvando..." : saveLabel}
        </button>
      </div>
    </AthleteAppShell>
  );
}
