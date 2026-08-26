"use client";

import Link from "next/link";
import { AthleteAppShell } from "@/components/app/athlete-shell";
import { FigmaIcon } from "@/components/auth/figma-icon";

export function CoachAjusteScreen() {
  return (
    <AthleteAppShell active="Coach" hideNav>
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex flex-col gap-5 p-6">
          <header className="flex flex-col items-center gap-3 text-center">
            <span className="inline-flex size-14 items-center justify-center rounded-[28px] border border-brand bg-brand-soft text-brand">
              <FigmaIcon src="/icons/coach-ajuste.svg" size={28} />
            </span>
            <h1 className="text-[22px] font-extrabold text-foreground">Seu plano foi ajustado</h1>
            <p className="text-[14px] text-muted">
              A Inteligência Artificial adaptou sua sessão de hoje para otimizar os resultados.
            </p>
          </header>

          <article className="flex flex-col gap-3.5 rounded-[var(--radius-xl)] border border-border bg-surface p-4">
            <p className="text-lg font-bold text-foreground">Agachamento</p>
            <div className="flex gap-3">
              <div className="flex min-w-0 flex-1 flex-col gap-1 rounded-[10px] border border-border bg-background p-3">
                <p className="text-[11px] font-bold uppercase text-muted">Planejado</p>
                <p className="text-[14px] font-semibold text-muted">4 séries × 8 reps</p>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1 rounded-[10px] border border-success bg-success/20 p-3">
                <p className="text-[11px] font-bold uppercase text-success">Hoje</p>
                <p className="text-[14px] font-bold text-foreground">3 séries × 8 reps</p>
              </div>
            </div>
          </article>

          <section className="flex flex-col gap-2.5">
            <h2 className="text-[13px] font-bold uppercase text-brand">Ajuste de hoje</h2>
            <div className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-border bg-surface p-3 text-[13px] text-foreground">
              <p><span className="font-bold">O que mudou. </span>Volume de agachamento de 4 para 3 séries.</p>
              <p><span className="font-bold">Por que mudou. </span>Recuperação de membros inferiores abaixo do habitual e desempenho em queda nas duas últimas sessões.</p>
              <p><span className="font-bold">Dados considerados. </span>Desempenho objetivo, recuperação habitual e aderência. Sem nota de prontidão.</p>
              <p><span className="font-bold">Este ajuste vale apenas para hoje? </span>Sim. Não altera divisão, frequência nem o bloco.</p>
              <p><span className="font-bold">Quando será reavaliado. </span>Na próxima sessão de pernas e na Revisão Semanal do Coach.</p>
            </div>
          </section>

          <section className="flex flex-col gap-1.5 rounded-[var(--radius-lg)] bg-surface p-3">
            <h2 className="text-[12px] font-bold uppercase text-muted">O que faremos?</h2>
            <p className="text-[13px] text-foreground">
              Reduziremos temporariamente o volume e reavaliaremos após o próximo treino.
            </p>
          </section>
        </div>

        <div className="flex flex-col gap-3 px-6 pb-6">
          <Link
            href="/app/coach"
            className="flex h-12 items-center justify-center rounded-[var(--radius-lg)] bg-brand text-[15px] font-bold text-on-brand"
          >
            Entendi
          </Link>
          <Link
            href="/app/coach"
            className="flex h-12 items-center justify-center rounded-[var(--radius-lg)] border border-border text-[15px] font-semibold text-foreground"
          >
            Quero saber mais
          </Link>
          <p className="text-center text-[11px] text-muted">Versão do contrato: v3.2</p>
        </div>
      </div>
    </AthleteAppShell>
  );
}
