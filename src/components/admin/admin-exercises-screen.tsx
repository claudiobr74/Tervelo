"use client";

import { useMemo, useState } from "react";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminStatusPanel } from "@/components/admin/admin-status-panel";
import { adminRequest } from "@/lib/admin/http";
import { useAdminQuery } from "@/lib/admin/use-admin-query";

type Exercise = {
  id: string;
  namePt: string;
  description: string | null;
  movementPatternId: string | null;
  movementPattern: string;
  aliases: string[];
  imageSrc?: string;
  category?: string;
};
type Pattern = { id: string; slug: string; name_pt: string };

export function AdminExercisesScreen() {
  const { loading, data, error, reload } = useAdminQuery<{
    exercises: Exercise[];
    patterns: Pattern[];
  }>("/api/admin/exercises");
  const [query, setQuery] = useState("");
  const [namePt, setNamePt] = useState("");
  const [patternId, setPatternId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const list = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("pt-BR");
    return (data?.exercises ?? []).filter(
      (item) =>
        !needle ||
        item.namePt.toLocaleLowerCase("pt-BR").includes(needle) ||
        (item.description ?? "").toLocaleLowerCase("pt-BR").includes(needle) ||
        (item.category ?? "").toLocaleLowerCase("pt-BR").includes(needle) ||
        item.aliases.some((alias) => alias.toLocaleLowerCase("pt-BR").includes(needle)),
    );
  }, [data, query]);
  const previewCap = 40;
  const truncated = !query.trim() && list.length > previewCap;
  const shown = truncated ? list.slice(0, previewCap) : list;
  const selected = shown.find((item) => item.id === selectedId) ?? shown[0];

  async function addExercise() {
    setMessage(null);
    const result = await adminRequest("/api/admin/exercises", {
      method: "POST",
      body: JSON.stringify({ namePt, movementPatternId: patternId || undefined }),
    });
    if (!result.ok) {
      setMessage("Não gravou o exercício no banco.");
      return;
    }
    setNamePt("");
    await reload();
  }

  return (
    <AdminShell
      title="Biblioteca de Exercícios"
      subtitle="Catálogo autorizado: título, descrição e GIF. O banco recebe o mesmo conteúdo pelo seed."
      active="Exercícios"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-[var(--radius-lg)] border border-border bg-surface px-4 py-3">
            <FigmaIcon src="/icons/admin/search.svg" alt="" size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar exercício..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </div>
          <span className="text-sm font-semibold text-brand">
            {data?.exercises.length ?? 0} exercícios na biblioteca
          </span>
        </div>
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void addExercise();
          }}
        >
          <label className="text-sm font-semibold">
            Novo exercício
            <input
              value={namePt}
              onChange={(event) => setNamePt(event.target.value)}
              className="mt-1 block rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-semibold">
            Padrão
            <select
              value={patternId}
              onChange={(event) => setPatternId(event.target.value)}
              className="mt-1 block rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">Sem padrão</option>
              {(data?.patterns ?? []).map((pattern) => (
                <option key={pattern.id} value={pattern.id}>
                  {pattern.name_pt}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="h-11 rounded-[var(--radius-md)] bg-brand px-4 text-sm font-bold text-on-brand"
          >
            Adicionar exercício
          </button>
        </form>
        {message ? <p className="text-sm text-error">{message}</p> : null}
        <AdminStatusPanel
          loading={loading}
          error={error}
          empty={!loading && !error && list.length === 0}
          emptyTitle="Catálogo vazio"
          emptyBody="A biblioteca autorizada ainda não está neste ambiente."
        />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="flex flex-col gap-2">
            {truncated ? (
              <p className="text-sm text-muted">
                Mostrando {shown.length} de {list.length}. Busque pelo nome para ver o restante.
              </p>
            ) : null}
            {shown.map((exercise) => (
              <button
                key={exercise.id}
                type="button"
                onClick={() => setSelectedId(exercise.id)}
                className={`rounded-[var(--radius-lg)] border p-3 text-left ${
                  exercise.id === selected?.id
                    ? "border-brand bg-surface"
                    : "border-border bg-surface"
                }`}
              >
                <p className="text-sm font-bold">{exercise.namePt}</p>
                <p className="text-xs text-muted">
                  {exercise.category || exercise.movementPattern || "Sem categoria"}
                </p>
              </button>
            ))}
          </div>
          {selected ? (
            <article className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
              <h2 className="text-xl font-extrabold">{selected.namePt}</h2>
              {selected.imageSrc ? (
                <span className="relative mt-4 block aspect-square w-full overflow-clip rounded-[var(--radius-md)] bg-background">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selected.imageSrc}
                    alt={`Demonstração em movimento: ${selected.namePt}`}
                    width={480}
                    height={480}
                    className="size-full object-contain"
                  />
                </span>
              ) : null}
              <p className="mt-4 whitespace-pre-wrap text-sm text-muted">
                {selected.description || "Sem descrição na ficha."}
              </p>
              <p className="mt-3 text-sm">
                <span className="font-bold">Categoria: </span>
                {selected.category || "—"}
              </p>
              <p className="mt-3 text-sm">
                <span className="font-bold">Padrão: </span>
                {selected.movementPattern || "—"}
              </p>
              <p className="mt-2 text-sm">
                <span className="font-bold">Apelidos: </span>
                {selected.aliases.join(", ") || "—"}
              </p>
            </article>
          ) : null}
        </div>
      </div>
    </AdminShell>
  );
}
