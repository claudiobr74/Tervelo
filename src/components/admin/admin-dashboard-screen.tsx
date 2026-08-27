"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { EmptyPanel } from "@/components/ui/empty-panel";

const EMPTY_KPIS = [
  { label: "Usuários Ativos", value: "0" },
  { label: "Novos esta Semana", value: "0" },
  { label: "Aderência Média", value: "—" },
  { label: "Treinos Realizados Hoje", value: "0" },
] as const;

export function AdminDashboardScreen() {
  return (
    <AdminShell active="Dashboard" title="Dashboard">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {EMPTY_KPIS.map((kpi) => (
            <article
              key={kpi.label}
              className="flex min-w-0 flex-col gap-3 rounded-[var(--radius-xl)] border border-border bg-surface p-5"
            >
              <p className="text-[13px] font-semibold uppercase text-muted">{kpi.label}</p>
              <p className="text-[32px] font-extrabold leading-none text-foreground">{kpi.value}</p>
            </article>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(16rem,24rem)]">
          <EmptyPanel
            title="Usuários Ativos ao Longo do Tempo"
            body="Sem contas reais, o gráfico fica vazio. Números de academia fictícia não entram aqui."
          />
          <EmptyPanel
            title="Custos de API Inteligência Artificial"
            body="Os custos só aparecem com uso real. Nada é preenchido com valores de exemplo."
          />
        </div>

        <EmptyPanel
          title="Últimos alertas do sistema"
          body="Não há alertas nem cadastros inventados. Quando houver eventos reais, eles listam aqui."
        />
      </div>
    </AdminShell>
  );
}
