"use client";

import { useMemo, useState } from "react";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { AdminShell } from "@/components/admin/admin-shell";
import { EmptyPanel } from "@/components/ui/empty-panel";
import { adherenceTone, filterAdminUsers } from "@/domain/admin/users";
import type { AdminUser } from "@/domain/admin/users";

const TONE: Record<ReturnType<typeof adherenceTone>, string> = {
  success: "text-success",
  brand: "text-brand",
  error: "text-error",
};

const ADMIN_USERS: AdminUser[] = [];

export function AdminUsersScreen() {
  const [query, setQuery] = useState("");
  const list = useMemo(
    () =>
      filterAdminUsers(ADMIN_USERS, {
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
                aria-label="Pesquisar usuário"
                placeholder="Pesquisar usuário..."
                className="min-w-0 flex-1 bg-transparent text-[13px] outline-none"
              />
            </label>
          </div>
          <button
            type="button"
            disabled
            title="Exportação em breve"
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
          {list.length === 0 ? (
            <div className="p-5">
              <EmptyPanel
                title="Nenhum atleta cadastrado"
                body="A lista só mostra contas reais. Atletas de exemplo não aparecem aqui."
              />
            </div>
          ) : (
            list.map((user) => (
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
                      user.status === "Ativo"
                        ? "bg-success/20 text-success"
                        : "bg-error/20 text-error"
                    }`}
                  >
                    {user.status}
                  </span>
                </div>
                <p className="w-[100px] shrink-0 text-[13px] font-medium">{user.plan}</p>
                <p className="w-[140px] shrink-0 text-[13px] text-muted">{user.goal}</p>
                <p className="w-[140px] shrink-0 text-[13px] text-muted">{user.lastWorkout}</p>
                <p
                  className={`w-[100px] shrink-0 text-[13px] font-bold ${TONE[adherenceTone(user.adherencePct)]}`}
                >
                  {user.adherencePct}%
                </p>
                <p className="w-[120px] shrink-0 text-[13px] text-tertiary">{user.lastActivity}</p>
              </div>
            ))
          )}
          <div className="flex min-w-[52rem] items-center justify-between bg-background-secondary p-3">
            <p className="text-[13px] text-muted">
              Mostrando {list.length} de {list.length} usuários
            </p>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
