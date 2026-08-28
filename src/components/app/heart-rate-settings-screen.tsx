"use client";

import Link from "next/link";
import { AthleteAppShell } from "@/components/app/athlete-shell";
import { HeartRateSettingsCard } from "@/components/app/heart-rate-settings";
import { AthleteStateSettingsCard } from "@/components/app/athlete-state-settings-card";
import { DataSyncSettingsCard } from "@/components/app/data-sync-settings-card";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { LogoutButton } from "@/components/auth/logout-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function HeartRateSettingsScreen() {
  return (
    <AthleteAppShell active="Mais">
      <div className="flex flex-col gap-5 px-6 pb-8 pt-4">
        <div className="flex items-center gap-3">
          <Link href="/app/profile" aria-label="Voltar" className="text-foreground">
            <FigmaIcon src="/icons/arrow-left.svg" alt="" size={24} />
          </Link>
          <div>
            <p className="text-xs font-bold uppercase text-brand">Configurações</p>
            <h1 className="text-xl font-extrabold text-foreground">Treino e dispositivos</h1>
          </div>
        </div>
        <HeartRateSettingsCard />
        <AthleteStateSettingsCard />
        <DataSyncSettingsCard />
        <section className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-4">
          <h2 className="text-base font-bold text-foreground">Aparência</h2>
          <ThemeToggle />
        </section>
        <section className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-4">
          <h2 className="text-base font-bold text-foreground">Conta</h2>
          <p className="text-sm text-muted">Encerra a sessão neste aparelho.</p>
          <LogoutButton variant="block" />
        </section>
      </div>
    </AthleteAppShell>
  );
}
