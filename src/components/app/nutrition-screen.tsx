"use client";

import { AthleteAppShell } from "@/components/app/athlete-shell";
import { EmptyPanel } from "@/components/ui/empty-panel";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { mlToLiters, targetProgressPercent } from "@/domain/nutrition/progress";
import {
  addHydration,
  saveNutritionCheckinToday,
  useNutritionOffline,
} from "@/lib/nutrition/offline-store";

function formatLiters(ml: number): string {
  return mlToLiters(ml).toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export function NutritionScreen() {
  const nutrition = useNutritionOffline();
  const fluidMl = nutrition.extraFluidMl;
  const fluidPercent = targetProgressPercent(fluidMl, Math.max(fluidMl, 1));

  return (
    <AthleteAppShell active="Mais">
      <div className="flex flex-col gap-5 px-6 pb-6 pt-4">
        <header className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold text-foreground">Nutrição</h1>
          </div>
          <p className="text-[13px] font-medium text-muted">
            Gerenciamento de dieta e metas diárias
          </p>
        </header>

        <EmptyPanel
          title="Sem plano nutricional"
          body="Quando houver metas de energia, proteína e refeições, elas aparecem aqui."
        />

        <article className="flex flex-col gap-4 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <h2 className="text-sm font-bold uppercase text-muted">Hidratação de hoje</h2>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-start justify-between text-[13px] font-medium text-foreground">
              <p>Água registrada</p>
              <p>
                {formatLiters(fluidMl)}
                <span className="text-muted"> L</span>
              </p>
            </div>
            <div
              role="progressbar"
              aria-label="Hidratação"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={fluidMl > 0 ? Math.round(fluidPercent) : 0}
              className="h-1.5 overflow-clip rounded-full bg-surface-secondary"
            >
              <div
                className="h-1.5 rounded-full bg-info"
                style={{ width: `${fluidMl > 0 ? fluidPercent : 0}%` }}
              />
            </div>
          </div>
        </article>

        <EmptyPanel
          title="Sem refeições registradas"
          body="Nenhuma refeição foi lançada hoje. O app não preenche café, almoço nem jantar por conta própria."
        />

        <section className="flex flex-col gap-3 rounded-[var(--radius-xl)] border border-border bg-surface p-4">
          <h2 className="text-sm font-bold text-foreground">Registros de hoje</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void addHydration(250)}
              className="flex h-11 flex-1 items-center justify-center rounded-[var(--radius-md)] border border-border text-sm font-bold text-foreground"
            >
              +250 ml água
            </button>
            <button
              type="button"
              onClick={() => void saveNutritionCheckinToday()}
              className="flex h-11 flex-1 items-center justify-center rounded-[var(--radius-md)] bg-brand text-sm font-bold text-on-brand"
            >
              Check-in nutricional
            </button>
          </div>
        </section>

        <article className="flex items-center gap-3 rounded-[var(--radius-xl)] border border-border bg-surface p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
            <FigmaIcon src="/icons/brain.svg" alt="" size={20} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="text-[11px] font-bold uppercase text-brand">
              Recomendações do nutricionista virtual
            </p>
            <p className="text-[13px] font-medium text-muted">
              Sem refeições nem metas, não há o que recomendar.
            </p>
          </div>
        </article>
      </div>
    </AthleteAppShell>
  );
}
