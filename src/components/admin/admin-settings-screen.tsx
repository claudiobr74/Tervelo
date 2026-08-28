"use client";

import { useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminStatusPanel } from "@/components/admin/admin-status-panel";
import { adminRequest } from "@/lib/admin/http";
import { useAdminQuery } from "@/lib/admin/use-admin-query";

type Me = { displayName: string; email: string | null; superAdmin: boolean; connected: boolean };
type Gyms = { gyms: { id: string; name: string; notes: string | null }[] };

export function AdminSettingsScreen() {
  const me = useAdminQuery<Me>("/api/admin/me");
  const gyms = useAdminQuery<Gyms>("/api/admin/gyms");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function createGym() {
    setMessage(null);
    const result = await adminRequest("/api/admin/gyms", {
      method: "POST",
      body: JSON.stringify({ name, notes }),
    });
    if (!result.ok) {
      setMessage(
        result.error === "nhost_unavailable"
          ? "Sem banco para gravar a academia."
          : "Não gravou a academia.",
      );
      return;
    }
    setName("");
    setNotes("");
    await gyms.reload();
  }

  return (
    <AdminShell
      active="Configurações"
      title="Configurações"
      subtitle="Unidade, papéis e academias no Nhost."
    >
      <div className="flex flex-col gap-6">
        <article className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <h2 className="text-base font-bold">Sessão</h2>
          <p className="mt-2 text-sm">{me.data?.displayName ?? "—"}</p>
          <p className="text-sm text-muted">
            {me.data?.email ?? "E-mail só aparece com sessão Nhost."}
          </p>
          <p className="mt-2 text-sm text-muted">
            {me.data?.superAdmin
              ? "Papel super_admin: publica contrato de IA e lê auditoria."
              : "Papel admin: opera catálogo, atletas e academias."}
          </p>
        </article>
        <article className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <h2 className="text-base font-bold">Academias</h2>
          <AdminStatusPanel
            loading={gyms.loading}
            error={gyms.error}
            empty={!gyms.loading && !gyms.error && (gyms.data?.gyms.length ?? 0) === 0}
            emptyTitle="Nenhuma academia cadastrada"
            emptyBody="Crie a unidade aqui. O dono no banco é a conta que grava."
          />
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {(gyms.data?.gyms ?? []).map((gym) => (
              <li key={gym.id} className="font-semibold">
                {gym.name}
              </li>
            ))}
          </ul>
          <form
            className="mt-4 flex flex-col gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void createGym();
            }}
          >
            <label className="text-sm font-semibold">
              Nome da academia
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-1 w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm font-semibold">
              Notas
              <input
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="mt-1 w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <button
              type="submit"
              className="h-11 w-fit rounded-[var(--radius-md)] bg-brand px-4 text-sm font-bold text-on-brand"
            >
              Criar academia
            </button>
            {message ? <p className="text-sm text-error">{message}</p> : null}
          </form>
        </article>
      </div>
    </AdminShell>
  );
}
