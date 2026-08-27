"use client";

import { useMemo, useState } from "react";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { AdminShell } from "@/components/admin/admin-shell";
import { adherenceTone, filterAdminUsers, formatThousands } from "@/domain/admin/users";
import { PREVIEW_ADMIN_USERS, PREVIEW_ADMIN_USER_TOTAL } from "@/lib/admin/preview-users";

const TONE: Record<ReturnType<typeof adherenceTone>, string> = {
  success: "text-success",
  brand: "text-brand",
  error: "text-error",
};

export function AdminUsersScreen() {
  const [query, setQuery] = useState("");
  const list = useMemo(
    () =>
      filterAdminUsers(PREVIEW_ADMIN_USERS, {
        query,
        status: "Todos",
        plan: "Todos",
        goal: "Todos",
      }),
    [query],
  );

  return (
    <AdminShell active="Usuários" title="Usuários">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex w-full max-w-[220px] min-w-0 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface px-4 py-2">
              <FigmaIcon src="/icons/admin/search.svg" alt="" size={14} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Pesquisar usuário..."
                className="min-w-0 flex-1 bg-transparent text-[13px] outline-none"
              />
            </label>
            <FilterChip label="Status: Todos" />
            <FilterChip label="Plano: Todos" />
            <FilterChip label="Objetivo: Todos" />
          </div>
          <button
            type="button"
            disabled
            title="FIGMA_PENDING — exportação"
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface px-4 py-2 text-[13px] font-semibold opacity-60"
          >
            <FigmaIcon src="/icons/admin/download.svg" alt="" size={14} />
            Exportar
          </button>
        </div>

        <div className="overflow-x-auto rounded-[var(--radius-xl)] border border-border bg-surface">
            <div className="flex min-w-[52rem] items-center gap-4 bg-surface-secondary p-3 text-xs font-bold text-muted">
            <p className="min-w-0 flex-1">Nome</p>
            <p className="w-[100px] shrink-0">Status</p>
            <p className="w-[100px] shrink-0">Plano</p>
            <p className="w-[140px] shrink-0">Objetivo</p>
            <p className="w-[140px] shrink-0">Último Treino</p>
            <p className="w-[100px] shrink-0">Aderência</p>
            <p className="w-[120px] shrink-0">Última Ativ.</p>
          </div>
          {list.map((user) => (
            <div
              key={user.id}
              className="flex min-w-[52rem] items-center gap-4 border-b border-border p-3 last:border-b-0"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user.avatar}
                  alt=""
                  width={32}
                  height={32}
                  className="size-8 rounded-full object-cover"
                />
                <p className="text-sm font-semibold">{user.name}</p>
              </div>
              <div className="w-[100px] shrink-0">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-[11px] font-bold ${
                    user.status === "Ativo" ? "bg-success/20 text-success" : "bg-error/20 text-error"
                  }`}
                >
                  {user.status}
                </span>
              </div>
              <p className="w-[100px] shrink-0 text-[13px] font-medium">{user.plan}</p>
              <p className="w-[140px] shrink-0 text-[13px] text-muted">{user.goal}</p>
              <p className="w-[140px] shrink-0 text-[13px] text-muted">{user.lastWorkout}</p>
              <p className={`w-[100px] shrink-0 text-[13px] font-bold ${TONE[adherenceTone(user.adherencePct)]}`}>
                {user.adherencePct}%
              </p>
              <p className="w-[120px] shrink-0 text-[13px] text-tertiary">{user.lastActivity}</p>
            </div>
          ))}
          <div className="flex min-w-[52rem] items-center justify-between bg-background-secondary p-3">
            <p className="text-[13px] text-muted">
              Mostrando {list.length} de {formatThousands(PREVIEW_ADMIN_USER_TOTAL)} usuários
            </p>
            <div className="flex items-center gap-2">
              <span className="rounded-[6px] bg-surface-pressed p-2 text-muted">
                <FigmaIcon src="/icons/admin/chevron-left.svg" alt="" size={12} />
              </span>
              <span className="rounded-[6px] border border-brand bg-brand-soft px-3 py-1.5 text-xs font-bold text-brand">
                1
              </span>
              <span className="px-3 py-1.5 text-xs text-muted">2</span>
              <span className="px-3 py-1.5 text-xs text-muted">3</span>
              <span className="rounded-[6px] bg-surface-pressed p-2 text-muted">
                <FigmaIcon src="/icons/admin/chevron-right.svg" alt="" size={12} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function FilterChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface py-2 pl-4 pr-3 text-[13px]">
      {label}
      <FigmaIcon src="/icons/admin/chevron-down.svg" alt="" size={14} />
    </span>
  );
}
