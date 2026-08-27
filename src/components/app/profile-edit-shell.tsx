"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { AthleteAppShell } from "@/components/app/athlete-shell";
import { PRIMARY_CTA_CLASS } from "@/components/auth/auth-shell";
import { FigmaIcon } from "@/components/auth/figma-icon";

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
        <button type="button" onClick={() => router.push("/app/profile")} className={PRIMARY_CTA_CLASS}>
          {saveLabel}
        </button>
      </div>
    </AthleteAppShell>
  );
}
