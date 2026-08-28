import Link from "next/link";
import type { ReactNode } from "react";
import { AthleteAppShell } from "@/components/app/athlete-shell";
import { FigmaIcon } from "@/components/auth/figma-icon";

export function ProfileSubpageShell({ title, children }: { title: string; children: ReactNode }) {
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
      </div>
    </AthleteAppShell>
  );
}
