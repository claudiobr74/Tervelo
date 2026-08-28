"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { adminRequest } from "@/lib/admin/http";

type SearchHit = { id: string; label: string; href: string };
type AlertItem = { id: string; title: string; entity: string; createdAt: string };

export function AdminHeaderControls() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [openSearch, setOpenSearch] = useState(false);
  const [openAlerts, setOpenAlerts] = useState(false);
  const [openHelp, setOpenHelp] = useState(false);
  const [hits, setHits] = useState<{ users: SearchHit[]; exercises: SearchHit[] }>({
    users: [],
    exercises: [],
  });
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (!openSearch) return;
      void adminRequest<{ users: SearchHit[]; exercises: SearchHit[] }>(
        `/api/admin/search?q=${encodeURIComponent(query)}`,
      ).then((result) => {
        if (result.ok) setHits({ users: result.data.users, exercises: result.data.exercises });
      });
    }, 200);
    return () => window.clearTimeout(handle);
  }, [query, openSearch]);

  useEffect(() => {
    if (!openAlerts) return;
    void adminRequest<{ items: AlertItem[] }>("/api/admin/alerts").then((result) => {
      if (result.ok) setAlerts(result.data.items);
    });
  }, [openAlerts]);

  return (
    <div className="relative flex items-center gap-3 lg:gap-4">
      <form
        className="hidden w-[280px] items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 md:flex"
        onSubmit={(event) => {
          event.preventDefault();
          router.push(
            query.trim() ? `/admin/users?q=${encodeURIComponent(query.trim())}` : "/admin/users",
          );
        }}
      >
        <FigmaIcon src="/icons/admin/search.svg" alt="" size={16} />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpenSearch(true);
          }}
          onFocus={() => setOpenSearch(true)}
          aria-label="Buscar atletas e exercícios"
          placeholder="Buscar atletas e exercícios"
          className="min-w-0 flex-1 bg-transparent text-[13px] outline-none"
        />
      </form>
      {openSearch ? (
        <div className="absolute right-28 top-12 z-20 hidden w-[320px] rounded-[var(--radius-lg)] border border-border bg-surface p-3 shadow-md md:block">
          {hits.users.length === 0 && hits.exercises.length === 0 ? (
            <p className="text-sm text-muted">Nenhum resultado no banco para esta busca.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-sm">
              {hits.users.map((hit) => (
                <li key={`u-${hit.id}`}>
                  <button
                    type="button"
                    className="w-full rounded-[var(--radius-sm)] px-2 py-1 text-left hover:bg-surface-secondary"
                    onClick={() => {
                      setOpenSearch(false);
                      router.push(hit.href);
                    }}
                  >
                    {hit.label}
                  </button>
                </li>
              ))}
              {hits.exercises.map((hit) => (
                <li key={`e-${hit.id}`}>
                  <button
                    type="button"
                    className="w-full rounded-[var(--radius-sm)] px-2 py-1 text-left hover:bg-surface-secondary"
                    onClick={() => {
                      setOpenSearch(false);
                      router.push(hit.href);
                    }}
                  >
                    {hit.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
      <button
        type="button"
        aria-label="Avisos administrativos"
        onClick={() => {
          setOpenAlerts((value) => !value);
          setOpenHelp(false);
        }}
        className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-surface"
      >
        <FigmaIcon src="/icons/admin/bell.svg" alt="" size={18} />
      </button>
      <button
        type="button"
        aria-label="Ajuda do painel"
        onClick={() => {
          setOpenHelp((value) => !value);
          setOpenAlerts(false);
        }}
        className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-surface"
      >
        <FigmaIcon src="/icons/admin/help.svg" alt="" size={18} />
      </button>
      {openAlerts ? (
        <div className="absolute right-0 top-12 z-20 w-[320px] rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-md">
          <p className="text-sm font-bold">Avisos</p>
          {alerts.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Nenhum evento de auditoria no banco.</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-2 text-sm">
              {alerts.map((item) => (
                <li key={item.id}>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-xs text-muted">
                    {item.entity} · {new Date(item.createdAt).toLocaleString("pt-BR")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
      {openHelp ? (
        <div className="absolute right-0 top-12 z-20 w-[320px] rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-md">
          <p className="text-sm font-bold">Painel</p>
          <p className="mt-2 text-sm text-muted">
            Controles gravam no Nhost com o JWT da sessão. Publicar contrato de IA exige
            super_admin. Dados ausentes ficam vazios — nunca são inventados.
          </p>
        </div>
      ) : null}
    </div>
  );
}
