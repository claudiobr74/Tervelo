"use client";

import Link from "next/link";
import { AthleteAppShell } from "@/components/app/athlete-shell";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { PRODUCT_NAMES } from "@/domain/athlete-state/labels";
import { useAthleteStateStore } from "@/lib/athlete-state/session-store";

export function CoachAjusteScreen() {
  const { todayAdjustment } = useAthleteStateStore();

  return (
    <AthleteAppShell active="Coach" hideNav>
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex flex-col gap-5 p-6">
          <header className="flex flex-col items-center gap-3 text-center">
            <span className="inline-flex size-14 items-center justify-center rounded-[28px] border border-brand bg-brand-soft text-brand">
              <FigmaIcon src="/icons/coach-ajuste.svg" size={28} />
            </span>
            <h1 className="text-[22px] font-extrabold text-foreground">
              {todayAdjustment ? "Seu plano foi ajustado" : "Nada foi ajustado hoje"}
            </h1>
            <p className="text-[14px] text-muted">
              {todayAdjustment
                ? "O Coach adaptou a sessão de hoje a partir do que você respondeu no check-in."
                : "Sua sessão de hoje segue exatamente como foi planejada."}
            </p>
          </header>

          {todayAdjustment ? (
            <section className="flex flex-col gap-2.5">
              <h2 className="text-[13px] font-bold uppercase text-brand">Ajuste de hoje</h2>
              <div className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-border bg-surface p-3 text-[13px] text-foreground">
                <p>
                  <span className="font-bold">O que mudou. </span>
                  {todayAdjustment.whatChanged}
                </p>
                <p>
                  <span className="font-bold">Por que mudou. </span>
                  {todayAdjustment.whyChanged}
                </p>
                <p>
                  <span className="font-bold">Dados considerados. </span>
                  {todayAdjustment.dataConsidered}
                </p>
                <p>
                  <span className="font-bold">Este ajuste vale apenas para hoje? </span>
                  {todayAdjustment.onlyToday
                    ? "Sim. Não altera divisão, frequência nem o bloco."
                    : "Não. O planejamento seguinte também considera esta mudança."}
                </p>
                <p>
                  <span className="font-bold">Quando será reavaliado. </span>
                  {todayAdjustment.reevaluateWhen}
                </p>
              </div>
            </section>
          ) : (
            <section className="flex flex-col gap-1.5 rounded-[var(--radius-lg)] bg-surface p-3">
              <p className="text-[13px] text-foreground">
                Ajustes aparecem aqui quando o {PRODUCT_NAMES.preWorkoutCheckin} indica pouco tempo,
                dor ou recuperação abaixo do habitual.
              </p>
            </section>
          )}
        </div>

        <div className="flex flex-col gap-3 px-6 pb-6">
          <Link
            href="/app/today"
            className="flex h-12 items-center justify-center rounded-[var(--radius-lg)] bg-brand text-[15px] font-bold text-on-brand"
          >
            Entendi
          </Link>
          <Link
            href="/app/coach/revisoes"
            className="flex h-12 items-center justify-center rounded-[var(--radius-lg)] border border-border text-[15px] font-semibold text-foreground"
          >
            Quero saber mais
          </Link>
        </div>
      </div>
    </AthleteAppShell>
  );
}
