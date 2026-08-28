"use client";

import { useState } from "react";
import Link from "next/link";
import { ProfileSubpageShell } from "@/components/app/profile-subpage-shell";
import { EmptyPanel } from "@/components/ui/empty-panel";
import { adminRequest } from "@/lib/admin/http";
import { useAdminQuery } from "@/lib/admin/use-admin-query";

type Gyms = { gyms: { id: string; name: string; notes: string | null }[] };

export function ProfileGymScreen() {
  const { loading, data, error, reload } = useAdminQuery<Gyms>("/api/me/gyms");
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function createGym() {
    setMessage(null);
    const result = await adminRequest("/api/me/gyms", {
      method: "POST",
      body: JSON.stringify({ name }),
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
    await reload();
  }

  const gyms = data?.gyms ?? [];

  return (
    <ProfileSubpageShell title="Academia e equipamentos">
      {loading ? <p className="text-sm text-muted">Consultando o banco…</p> : null}
      {error ? (
        <EmptyPanel title="Banco indisponível" body="Esta tela não preenche academia inventada." />
      ) : null}
      {!loading && !error && gyms.length === 0 ? (
        <EmptyPanel
          title="Nenhuma academia vinculada"
          body="Cadastre a unidade em que você treina. O inventário de anilhas usa essa academia."
        />
      ) : null}
      <ul className="flex flex-col gap-2">
        {gyms.map((gym) => (
          <li
            key={gym.id}
            className="rounded-[var(--radius-lg)] border border-border bg-surface p-4"
          >
            <p className="font-semibold">{gym.name}</p>
            {gym.notes ? <p className="text-sm text-muted">{gym.notes}</p> : null}
          </li>
        ))}
      </ul>
      <form
        className="flex flex-col gap-2"
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
        <button
          type="submit"
          className="h-11 w-fit rounded-[var(--radius-md)] bg-brand px-4 text-sm font-bold text-on-brand"
        >
          Cadastrar academia
        </button>
        {message ? <p className="text-sm text-error">{message}</p> : null}
      </form>
      <Link href="/app/plates" className="text-sm font-semibold text-brand">
        Abrir montagem da barra
      </Link>
      <Link href="/app/equipment" className="text-sm font-semibold text-brand">
        Catálogo de equipamentos
      </Link>
    </ProfileSubpageShell>
  );
}
