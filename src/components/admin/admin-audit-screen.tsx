"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { AdminStatusPanel } from "@/components/admin/admin-status-panel";
import { useAdminQuery } from "@/lib/admin/use-admin-query";

type AuditData = {
  audit_logs: {
    id: string;
    actor_user_id: string | null;
    action: string;
    entity_type: string;
    created_at: string;
  }[];
  ai_decisions: {
    id: string;
    agent: string;
    action: string | null;
    rationale: string | null;
    created_at: string;
    accepted: boolean | null;
    overridden: boolean;
  }[];
  requiresSuperAdmin: boolean;
};

export function AdminAuditScreen() {
  const { loading, data, error } = useAdminQuery<AuditData>("/api/admin/audit");
  const logs = data?.audit_logs ?? [];
  const decisions = data?.ai_decisions ?? [];

  return (
    <AdminShell active="Auditoria" title="Auditoria e Decisões da IA">
      <div className="flex flex-col gap-6">
        {data?.requiresSuperAdmin ? (
          <p className="text-sm text-muted">A leitura de audit_logs exige super_admin.</p>
        ) : null}
        <AdminStatusPanel
          loading={loading}
          error={error}
          empty={!loading && !error && logs.length === 0 && decisions.length === 0}
          emptyTitle="Nenhuma decisão registrada"
          emptyBody="A auditoria só lista eventos reais de audit_logs e ai_decisions."
        />
        {logs.length > 0 ? (
          <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
            <h2 className="text-base font-bold">Eventos administrativos</h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {logs.map((row) => (
                <li key={row.id} className="flex flex-wrap justify-between gap-2">
                  <span className="font-semibold">{row.action}</span>
                  <span className="text-muted">
                    {row.entity_type} · {new Date(row.created_at).toLocaleString("pt-BR")}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {decisions.length > 0 ? (
          <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
            <h2 className="text-base font-bold">Decisões da IA</h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {decisions.map((row) => (
                <li key={row.id}>
                  <p className="font-semibold">
                    {row.agent}
                    {row.action ? ` · ${row.action}` : ""}
                  </p>
                  <p className="text-muted">{row.rationale || "Sem racional gravado."}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </AdminShell>
  );
}
