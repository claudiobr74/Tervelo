"use client";

import { FigmaIcon } from "@/components/auth/figma-icon";
import { AdminShell } from "@/components/admin/admin-shell";
import { PREVIEW_DASHBOARD } from "@/lib/admin/preview-console";

const MAX_COST = Math.max(...PREVIEW_DASHBOARD.aiCosts.map((item) => item.usd));

export function AdminDashboardScreen() {
  return (
    <AdminShell active="Dashboard" title="Dashboard">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {PREVIEW_DASHBOARD.kpis.map((kpi) => (
            <article
              key={kpi.label}
              className="flex min-w-0 flex-col gap-3 rounded-[var(--radius-xl)] border border-border bg-surface p-5"
            >
              <p className="text-[13px] font-semibold uppercase text-muted">{kpi.label}</p>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p className="text-[32px] font-extrabold leading-none text-foreground">{kpi.value}</p>
                <span
                  className={`inline-flex items-center gap-1 rounded-[6px] px-2 py-1 text-[11px] font-bold ${
                    kpi.tone === "up" ? "bg-success/20 text-success" : "bg-error/20 text-error"
                  }`}
                >
                  <FigmaIcon
                    src={kpi.tone === "up" ? "/icons/trending-up.svg" : "/icons/trending-down.svg"}
                    alt=""
                    size={10}
                  />
                  {kpi.delta}
                </span>
              </div>
            </article>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(16rem,24rem)]">
          <article className="flex h-[280px] flex-col gap-4 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[15px] font-bold">Usuários Ativos ao Longo do Tempo</p>
              <p className="text-xs text-muted">Últimos 6 meses</p>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/admin/sparkline.svg" alt="" width={480} height={160} className="h-40 w-full max-w-[480px]" />
              <div className="flex w-full max-w-[480px] justify-between pt-2 text-[11px] text-tertiary">
                {PREVIEW_DASHBOARD.months.map((month) => (
                  <span key={month}>{month}</span>
                ))}
              </div>
            </div>
          </article>
          <article className="flex h-[280px] flex-col gap-4 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[15px] font-bold">Custos de API Inteligência Artificial</p>
              <p className="text-xs text-brand">US$ por mês</p>
            </div>
            <div className="flex flex-1 flex-col justify-center gap-4">
              {PREVIEW_DASHBOARD.aiCosts.map((row) => (
                <div key={row.agent} className="flex items-center gap-3">
                  <p className="w-[84px] shrink-0 text-xs text-muted">{row.agent}</p>
                  <div className="h-2 min-w-0 flex-1 overflow-hidden rounded bg-surface-pressed">
                    <div
                      className="h-full rounded bg-brand"
                      style={{ width: `${Math.round((row.usd / MAX_COST) * 100)}%` }}
                    />
                  </div>
                  <p className="w-[60px] shrink-0 text-right text-xs font-bold">US$ {row.usd}</p>
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,21rem)_minmax(0,1fr)]">
          <div className="flex flex-col gap-3">
            {PREVIEW_DASHBOARD.alerts.map((alert) => (
              <article
                key={alert.title}
                className={`flex items-center gap-3 rounded-[var(--radius-lg)] border p-4 ${
                  alert.tone === "critical"
                    ? "border-error bg-error/20 text-foreground"
                    : "border-border bg-brand-soft"
                }`}
              >
                <FigmaIcon
                  src={alert.tone === "critical" ? "/icons/alert-triangle.svg" : "/icons/trending-up.svg"}
                  alt=""
                  size={20}
                  className={alert.tone === "critical" ? "text-error" : "text-brand"}
                />
                <div className="min-w-0">
                  <p className="text-[13px] font-bold">{alert.title}</p>
                  <p className={`text-xs ${alert.tone === "critical" ? "text-foreground" : "text-muted"}`}>
                    {alert.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
          <article className="flex flex-col gap-3 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
            <p className="text-[15px] font-bold">Últimos alertas do sistema</p>
            <div className="overflow-x-auto">
              <div className="flex min-w-[28rem] border-b border-border pb-2 text-xs font-bold text-tertiary">
                <p className="w-[120px] shrink-0">Evento</p>
                <p className="min-w-0 flex-1">Descrição</p>
                <p className="w-[100px] shrink-0 text-right">Hora</p>
              </div>
              {PREVIEW_DASHBOARD.systemAlerts.map((row) => (
                <div key={row.event} className="flex min-w-[28rem] items-start text-[13px]">
                  <p
                    className={`w-[120px] shrink-0 font-semibold ${
                      row.tone === "error"
                        ? "text-error"
                        : row.tone === "success"
                          ? "text-success"
                          : "text-brand"
                    }`}
                  >
                    {row.event}
                  </p>
                  <p className="min-w-0 flex-1 text-muted">{row.description}</p>
                  <p className="w-[100px] shrink-0 text-right text-tertiary">{row.when}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </AdminShell>
  );
}
