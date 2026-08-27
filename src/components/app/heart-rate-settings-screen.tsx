"use client";

import Link from "next/link";
import { AthleteAppShell } from "@/components/app/athlete-shell";
import { HeartRateSettingsCard } from "@/components/app/heart-rate-settings";
import { AthleteStateSettingsCard } from "@/components/app/athlete-state-settings-card";
import { DataSyncSettingsCard } from "@/components/app/data-sync-settings-card";
import { FigmaIcon } from "@/components/auth/figma-icon";

export function HeartRateSettingsScreen() {
  return (
    <AthleteAppShell active="Mais">
      <div className="flex flex-col gap-5 px-6 pb-8 pt-4">
        <div className="flex items-center gap-3">
          <Link href="/app/today" aria-label="Voltar" className="text-foreground">
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
      </div>
    </AthleteAppShell>
  );
}
