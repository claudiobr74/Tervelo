"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { AdminStatusPanel } from "@/components/admin/admin-status-panel";
import { useAdminQuery } from "@/lib/admin/use-admin-query";

type Overview = {
  activeUsers: number;
  newThisWeek: number;
  workoutsToday: number;
  adherencePercent: number | null;
  connected: boolean;
};

export function AdminDashboardScreen() {
  const { loading, data, error } = useAdminQuery<Overview>("/api/admin/overview");
  const kpis = [
    { label: "Usuários Ativos", value: data ? String(data.activeUsers) : "—" },
    { label: "Novos esta Semana", value: data ? String(data.newThisWeek) : "—" },
    {
      label: "Aderência Média",
      value: data?.adherencePercent == null ? "—" : `${data.adherencePercent}%`,
    },
    { label: "Treinos Realizados Hoje", value: data ? String(data.workoutsToday) : "—" },
  ];

  return (
    <AdminShell active="Dashboard" title="Dashboard">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <article
              key={kpi.label}
              className="flex min-w-0 flex-col gap-3 rounded-[var(--radius-xl)] border border-border bg-surface p-5"
            >
              <p className="text-[13px] font-semibold uppercase text-muted">{kpi.label}</p>
              <p className="text-[32px] font-extrabold leading-none text-foreground">{kpi.value}</p>
            </article>
          ))}
        </div>
        <AdminStatusPanel
          loading={loading}
          error={error}
          empty={Boolean(data && data.activeUsers === 0 && data.workoutsToday === 0)}
          emptyTitle="Sem movimento no banco"
          emptyBody="Quando houver contas e treinos reais, os totais sobem aqui. Aderência usa sessões completed da semana."
        />
      </div>
    </AdminShell>
  );
}
