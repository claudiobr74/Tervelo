"use client";

import { AthleteAppShell } from "@/components/app/athlete-shell";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { mlToLiters, targetProgressPercent } from "@/domain/nutrition/progress";
import {
  PREVIEW_MEALS,
  PREVIEW_NUTRITION_INSIGHT,
  PREVIEW_NUTRITION_INTAKE,
  PREVIEW_NUTRITION_OBJECTIVE,
  PREVIEW_NUTRITION_TARGET,
} from "@/lib/nutrition/preview";
import {
  addHydration,
  saveNutritionCheckinToday,
  toggleMealAdherence,
  useNutritionOffline,
} from "@/lib/nutrition/offline-store";

function formatInt(value: number): string {
  return value.toLocaleString("pt-BR");
}

function formatLiters(ml: number): string {
  return mlToLiters(ml).toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

const TARGETS = [
  {
    key: "energy",
    label: "Energia",
    current: formatInt(PREVIEW_NUTRITION_INTAKE.energyKcal),
    rest: `/ ${formatInt(PREVIEW_NUTRITION_TARGET.energyKcal)} kcal`,
    percent: targetProgressPercent(
      PREVIEW_NUTRITION_INTAKE.energyKcal,
      PREVIEW_NUTRITION_TARGET.energyKcal,
    ),
    bar: "bg-brand",
  },
  {
    key: "protein",
    label: "Proteínas",
    current: String(PREVIEW_NUTRITION_INTAKE.proteinG),
    rest: `/ ${PREVIEW_NUTRITION_TARGET.proteinG} g`,
    percent: targetProgressPercent(
      PREVIEW_NUTRITION_INTAKE.proteinG,
      PREVIEW_NUTRITION_TARGET.proteinG,
    ),
    bar: "bg-success",
  },
  {
    key: "carbs",
    label: "Carboidratos",
    current: String(PREVIEW_NUTRITION_INTAKE.carbohydrateG),
    rest: `/ ${PREVIEW_NUTRITION_TARGET.carbohydrateG} g`,
    percent: targetProgressPercent(
      PREVIEW_NUTRITION_INTAKE.carbohydrateG,
      PREVIEW_NUTRITION_TARGET.carbohydrateG,
    ),
    bar: "bg-info",
  },
  {
    key: "fat",
    label: "Gorduras",
    current: String(PREVIEW_NUTRITION_INTAKE.fatG),
    rest: `/ ${PREVIEW_NUTRITION_TARGET.fatG} g`,
    percent: targetProgressPercent(PREVIEW_NUTRITION_INTAKE.fatG, PREVIEW_NUTRITION_TARGET.fatG),
    bar: "bg-error",
  },
  {
    key: "fluid",
    label: "Hidratação",
    current: formatLiters(PREVIEW_NUTRITION_INTAKE.fluidMl),
    rest: `/ ${formatLiters(PREVIEW_NUTRITION_TARGET.fluidMl)} L`,
    percent: targetProgressPercent(
      PREVIEW_NUTRITION_INTAKE.fluidMl,
      PREVIEW_NUTRITION_TARGET.fluidMl,
    ),
    bar: "bg-info",
  },
] as const;

export function NutritionScreen() {
  const nutrition = useNutritionOffline();
  const fluidCurrent = PREVIEW_NUTRITION_INTAKE.fluidMl + nutrition.extraFluidMl;
  const targets = TARGETS.map((item) =>
    item.key === "fluid"
      ? {
          ...item,
          current: formatLiters(fluidCurrent),
          percent: targetProgressPercent(fluidCurrent, PREVIEW_NUTRITION_TARGET.fluidMl),
        }
      : item,
  );

  return (
    <AthleteAppShell active="Mais">
      <div className="flex flex-col gap-5 px-6 pb-6 pt-4">
        <header className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold text-foreground">Nutrição</h1>
            <button
              type="button"
              title="FIGMA_PENDING — calendário do atleta"
              aria-label="Calendário"
              className="text-muted"
            >
              <FigmaIcon src="/icons/calendar.svg" alt="" size={24} />
            </button>
          </div>
          <p className="text-[13px] font-medium text-muted">
            Gerenciamento de dieta e metas diárias
          </p>
        </header>

        <article className="flex flex-col gap-2 rounded-[var(--radius-xl)] border border-brand bg-brand-soft p-4">
          <p className="text-sm font-bold uppercase text-brand">Objetivo atual</p>
          <p className="text-sm font-bold text-foreground">{PREVIEW_NUTRITION_OBJECTIVE}</p>
        </article>

        <article className="flex flex-col gap-4 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <h2 className="text-sm font-bold uppercase text-muted">Metas diárias</h2>
          {targets.map((item) => (
            <div key={item.key} className="flex flex-col gap-1.5">
              <div className="flex items-start justify-between text-[13px] font-medium text-foreground">
                <p>{item.label}</p>
                <p>
                  {item.current}
                  <span className="text-muted"> {item.rest}</span>
                </p>
              </div>
              <div
                role="progressbar"
                aria-label={item.label}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(item.percent)}
                className="h-1.5 overflow-clip rounded-full bg-surface-secondary"
              >
                <div className={`h-1.5 rounded-full ${item.bar}`} style={{ width: `${item.percent}%` }} />
              </div>
            </div>
          ))}
        </article>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-bold uppercase text-muted">Distribuição ao longo do dia</h2>
          {PREVIEW_MEALS.map((meal) => (
            <article
              key={meal.name}
              className="flex flex-wrap items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-foreground">{meal.name}</p>
                <p className="text-[11px] font-medium text-muted">
                  {formatInt(meal.energyKcal)} kcal • {meal.proteinG}g prot • {meal.carbohydrateG}g carb
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1 text-muted">
                <FigmaIcon src="/icons/clock.svg" alt="" size={14} />
                <p className="text-[11px] font-medium">{meal.time}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleMealAdherence(meal.name)}
                className={`shrink-0 text-[11px] font-bold ${
                  nutrition.adheredMeals.includes(meal.name) ? "text-success" : "text-brand"
                }`}
              >
                {nutrition.adheredMeals.includes(meal.name) ? "Registrada" : "Marcar"}
              </button>
            </article>
          ))}
        </section>

        <section className="flex flex-col gap-3 rounded-[var(--radius-xl)] border border-border bg-surface p-4">
          <p className="text-xs font-bold uppercase text-brand">FIGMA_UI_PENDING</p>
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
            <p className="text-[13px] font-medium text-foreground">“{PREVIEW_NUTRITION_INSIGHT}”</p>
          </div>
        </article>
      </div>
    </AthleteAppShell>
  );
}
