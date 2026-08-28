"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminStatusPanel } from "@/components/admin/admin-status-panel";
import { useAdminQuery } from "@/lib/admin/use-admin-query";

type AdminUserRow = {
  id: string;
  name: string;
  locale: string;
  createdAt: string;
  goals: string[];
  lastSession: string | null;
};

export function AdminUsersScreen() {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const { loading, data, error } = useAdminQuery<AdminUserRow[]>("/api/admin/users");
  const list = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("pt-BR");
    return (data ?? []).filter(
      (row) => !needle || row.name.toLocaleLowerCase("pt-BR").includes(needle),
    );
  }, [data, query]);

  return (
    <AdminShell active="Usuários" title="Usuários">
      <div className="flex flex-col gap-6">
        <label className="flex w-full max-w-[280px] items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface px-4 py-2">
          <FigmaIcon src="/icons/admin/search.svg" alt="" size={14} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Pesquisar usuário"
            placeholder="Pesquisar usuário..."
            className="min-w-0 flex-1 bg-transparent text-[13px] outline-none"
          />
        </label>
        <AdminStatusPanel
          loading={loading}
          error={error}
          empty={!loading && !error && list.length === 0}
          emptyTitle="Nenhum atleta no banco"
          emptyBody="A lista só mostra contas reais. Nada de exemplo entra aqui."
        />
        {list.length > 0 ? (
          <div className="overflow-x-auto rounded-[var(--radius-xl)] border border-border bg-surface">
            <div className="flex min-w-[40rem] items-center gap-4 bg-surface-secondary p-3 text-xs font-bold text-muted">
              <p className="min-w-0 flex-1">Nome</p>
              <p className="w-[140px] shrink-0">Objetivo</p>
              <p className="w-[160px] shrink-0">Último treino</p>
              <p className="w-[160px] shrink-0">Criado em</p>
            </div>
            {list.map((user) => (
              <Link
                key={user.id}
                href={`/admin/users/${user.id}`}
                className="flex min-w-[40rem] items-center gap-4 border-b border-border p-3 last:border-b-0 hover:bg-surface-hover"
              >
                <p className="min-w-0 flex-1 text-sm font-semibold">{user.name}</p>
                <p className="w-[140px] shrink-0 text-[13px] text-muted">{user.goals[0] ?? "—"}</p>
                <p className="w-[160px] shrink-0 text-[13px] text-muted">
                  {user.lastSession ? new Date(user.lastSession).toLocaleString("pt-BR") : "—"}
                </p>
                <p className="w-[160px] shrink-0 text-[13px] text-muted">
                  {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </Link>
            ))}
            <div className="bg-background-secondary p-3 text-[13px] text-muted">
              Mostrando {list.length} de {data?.length ?? 0} usuários
            </div>
          </div>
        ) : null}
      </div>
    </AdminShell>
  );
}
