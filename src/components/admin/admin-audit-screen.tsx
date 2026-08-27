"use client";

import { useState } from "react";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { AdminShell } from "@/components/admin/admin-shell";
import { PREVIEW_AUDIT_LOGS } from "@/lib/admin/preview-console";

const DECISION: Record<(typeof PREVIEW_AUDIT_LOGS)[number]["decisionTone"], string> = {
  brand: "bg-brand-soft text-brand",
  success: "bg-success/20 text-success",
};

const OUTCOME: Record<(typeof PREVIEW_AUDIT_LOGS)[number]["outcomeTone"], string> = {
  success: "bg-success/20 text-success",
  muted: "bg-surface-pressed text-muted",
};

export function AdminAuditScreen() {
  const [openId, setOpenId] = useState<string>(PREVIEW_AUDIT_LOGS[0].id);

  return (
    <AdminShell active="Auditoria" title="Auditoria e Decisões da IA">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap gap-3">
          <FilterChip label="Data: Hoje" icon="/icons/calendar.svg" />
          <FilterChip label="Usuário: Todos" />
          <FilterChip label="Decisão: Redução Volume" />
          <FilterChip label="Agente: Tervelo IA v3.2" />
        </div>
        <div className="flex flex-col gap-4">
          {PREVIEW_AUDIT_LOGS.map((log) => {
            const open = log.id === openId;
            return (
              <article
                key={log.id}
                className={`rounded-[var(--radius-xl)] border bg-surface p-5 ${
                  open ? "border-2 border-brand" : "border-border"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(open ? "" : log.id)}
                  className="flex w-full flex-col items-start justify-between gap-3 text-left sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={log.avatar}
                      alt=""
                      width={36}
                      height={36}
                      className="size-9 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-bold">{log.name}</p>
                      <p className="whitespace-pre text-xs text-muted">{log.when}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${DECISION[log.decisionTone]}`}>
                      {log.decision}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${OUTCOME[log.outcomeTone]}`}>
                      {log.outcome}
                    </span>
                    <FigmaIcon
                      src={open ? "/icons/admin/chevron-up.svg" : "/icons/admin/chevron-down.svg"}
                      alt=""
                      size={16}
                    />
                  </div>
                </button>
                {open ? (
                  <div className="mt-4 flex flex-col gap-3 rounded-[var(--radius-md)] border border-border bg-background p-4">
                    <div className="flex flex-col gap-4 md:flex-row">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold uppercase text-muted">Decisão Proposta</p>
                        <p className="mt-1 text-sm font-semibold">{log.proposed}</p>
                      </div>
                      <div className="min-w-0 md:w-[280px] md:shrink-0">
                        <p className="text-xs font-bold uppercase text-muted">Regra Aplicada</p>
                        <p className="mt-1 text-sm font-semibold text-success">{log.rule}</p>
                      </div>
                    </div>
                    <div className="border-t border-border pt-2">
                      <p className="text-xs font-bold uppercase text-muted">
                        Motivação e Evidências Biométricas
                      </p>
                      <p className="mt-1 text-[13px] leading-[18px] text-foreground">“{log.evidence}”</p>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </AdminShell>
  );
}

function FilterChip({ label, icon }: { label: string; icon?: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface py-2 pl-4 pr-3 text-[13px]">
      {label}
      <FigmaIcon src={icon ?? "/icons/admin/chevron-down.svg"} alt="" size={14} />
    </span>
  );
}
