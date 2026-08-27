"use client";

import Link from "next/link";
import { AthleteAppShell } from "@/components/app/athlete-shell";
import { WorkoutSyncHint } from "@/components/app/sync-status-indicator";
import { FigmaIcon } from "@/components/auth/figma-icon";

export function WorkoutSessionScreen() {
  return (
    <AthleteAppShell active="Treino">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-col gap-3 px-6 pb-5 pt-4">
          <div className="flex items-center justify-between">
            <Link href="/app/today" aria-label="Voltar" className="text-foreground">
              <FigmaIcon src="/icons/arrow-left.svg" alt="" size={24} />
            </Link>
            <p className="text-base font-semibold text-foreground">Sessão de Treino</p>
            <Link
              href="/app/plates"
              aria-label="Calculadora de anilhas"
              className="text-foreground"
            >
              <FigmaIcon src="/icons/dumbbell.svg" alt="" size={22} />
            </Link>
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-foreground">Nenhum treino prescrito</h1>
            <p className="text-[13px] text-muted">Quando houver um plano, a sessão aparece aqui.</p>
            <WorkoutSyncHint />
          </div>
        </div>

        <div className="flex flex-col gap-4 px-6 pb-6">
          <Link
            href="/app/today"
            className="flex h-[54px] w-full items-center justify-center rounded-[var(--radius-lg)] border border-border text-base font-bold text-foreground"
          >
            Voltar para hoje
          </Link>
        </div>
      </div>
    </AthleteAppShell>
  );
}
