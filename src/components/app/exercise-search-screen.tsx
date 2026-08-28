"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { AthleteAppShell } from "@/components/app/athlete-shell";
import {
  searchCatalogExercises,
  type CatalogExercise,
  type ExerciseSearchFilter,
} from "@/domain/exercise/search";
import { useAdminQuery } from "@/lib/admin/use-admin-query";
import { EmptyPanel } from "@/components/ui/empty-panel";

const FILTERS: { id: ExerciseSearchFilter; label: string }[] = [
  { id: "muscle", label: "Grupo muscular" },
  { id: "equipment", label: "Equipamento" },
  { id: "pattern", label: "Padrão" },
  { id: "favorites", label: "Favoritos" },
];

const FAVORITES_KEY = "tervelo-exercise-favorites";
const EMPTY_FAVORITES: string[] = [];

let cachedFavoritesRaw: string | null = null;
let cachedFavorites: string[] = EMPTY_FAVORITES;

function readFavorites(): string[] {
  if (typeof window === "undefined") return EMPTY_FAVORITES;
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    if (raw === cachedFavoritesRaw) return cachedFavorites;
    cachedFavoritesRaw = raw;
    if (!raw) {
      cachedFavorites = EMPTY_FAVORITES;
      return cachedFavorites;
    }
    const parsed = JSON.parse(raw) as unknown;
    cachedFavorites = Array.isArray(parsed) ? (parsed as string[]) : EMPTY_FAVORITES;
    return cachedFavorites;
  } catch {
    return EMPTY_FAVORITES;
  }
}

function getServerFavorites(): string[] {
  return EMPTY_FAVORITES;
}

const favoriteListeners = new Set<() => void>();

function subscribeFavorites(listener: () => void) {
  favoriteListeners.add(listener);
  return () => {
    favoriteListeners.delete(listener);
  };
}

function emitFavorites() {
  for (const listener of favoriteListeners) listener();
}

function toggleFavorite(id: string) {
  const current = new Set(readFavorites());
  if (current.has(id)) current.delete(id);
  else current.add(id);
  const next = [...current];
  cachedFavoritesRaw = JSON.stringify(next);
  cachedFavorites = next;
  window.localStorage.setItem(FAVORITES_KEY, cachedFavoritesRaw);
  emitFavorites();
}

function withFavorites(exercises: CatalogExercise[], ids: string[]): CatalogExercise[] {
  const extra = new Set(ids);
  return exercises.map((exercise) => ({
    ...exercise,
    favorite: Boolean(exercise.favorite || extra.has(exercise.id)),
  }));
}

function categoryLine(exercise: CatalogExercise): string {
  return [exercise.primaryMuscle, exercise.movementPattern].filter(Boolean).join(" • ");
}

export function ExerciseSearchScreen() {
  const catalogQuery = useAdminQuery<{ exercises: CatalogExercise[] }>("/api/me/catalog");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ExerciseSearchFilter>("muscle");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const storedFavorites = useSyncExternalStore(
    subscribeFavorites,
    readFavorites,
    getServerFavorites,
  );
  const catalog = useMemo(
    () => withFavorites(catalogQuery.data?.exercises ?? [], storedFavorites),
    [catalogQuery.data?.exercises, storedFavorites],
  );
  const results = searchCatalogExercises(catalog, query, filter);
  const selected = selectedId ? (catalog.find((item) => item.id === selectedId) ?? null) : null;
  const previewCap = 24;
  const truncated = !query && filter !== "favorites" && results.length > previewCap;
  const visible = truncated ? results.slice(0, previewCap) : results;

  return (
    <AthleteAppShell active="Treino">
      <div className="flex flex-col gap-3 px-6 pb-3 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-2xl font-extrabold text-foreground">Exercícios</h1>
            {!catalogQuery.loading && catalog.length > 0 ? (
              <p className="text-xs text-muted">{catalog.length} na biblioteca</p>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-surface px-4 py-3">
          <FigmaIcon src="/icons/search.svg" alt="" size={18} className="text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Buscar exercício"
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-tertiary"
            placeholder="Buscar exercício"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Limpar busca"
              className="text-muted"
            >
              <FigmaIcon src="/icons/close.svg" alt="" size={18} />
            </button>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => {
            const active = filter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  active
                    ? "border-brand bg-brand-soft text-brand"
                    : "border-border bg-surface text-muted"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-4 px-6 pb-6">
        {catalogQuery.loading ? <p className="text-sm text-muted">Consultando a biblioteca…</p> : null}
        {catalogQuery.error ? (
          <EmptyPanel title="Biblioteca indisponível" body="Não foi possível ler o catálogo autorizado." />
        ) : null}
        {!catalogQuery.loading && !catalogQuery.error && catalog.length === 0 ? (
          <EmptyPanel
            title="Catálogo vazio"
            body="A biblioteca autorizada ainda não está neste ambiente."
          />
        ) : null}

        {selected ? (
          <article className="flex flex-col gap-4 rounded-[var(--radius-xl)] border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="text-sm font-semibold text-brand"
              >
                Voltar à lista
              </button>
              <button
                type="button"
                aria-label={selected.favorite ? "Remover dos favoritos" : "Favoritar"}
                onClick={() => toggleFavorite(selected.id)}
                className={selected.favorite ? "text-brand" : "text-muted"}
              >
                <FigmaIcon
                  src={selected.favorite ? "/icons/heart-filled.svg" : "/icons/heart.svg"}
                  alt=""
                  size={20}
                />
              </button>
            </div>
            <h2 className="text-lg font-extrabold text-foreground">{selected.namePt}</h2>
            {selected.imageSrc ? (
              <span className="relative block aspect-square w-full overflow-clip rounded-[var(--radius-md)] bg-background">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selected.imageSrc}
                  alt={`Demonstração em movimento: ${selected.namePt}`}
                  width={342}
                  height={342}
                  className="size-full object-contain"
                />
              </span>
            ) : (
              <p className="text-sm text-muted">GIF ainda não disponível neste exercício.</p>
            )}
            <div className="flex flex-col gap-2 text-xs text-muted">
              {selected.description ? (
                <p className="whitespace-pre-wrap text-sm leading-5 text-foreground">
                  {selected.description}
                </p>
              ) : (
                <p className="text-sm">Sem descrição na ficha.</p>
              )}
              {selected.primaryMuscle ? (
                <p>
                  <span className="font-bold text-foreground">Categoria: </span>
                  {selected.primaryMuscle}
                </p>
              ) : null}
              {selected.secondaryMuscles.length > 0 ? (
                <p>
                  <span className="font-bold text-foreground">Secundários: </span>
                  {selected.secondaryMuscles.join(", ")}
                </p>
              ) : null}
              {selected.equipmentName ? (
                <p>
                  <span className="font-bold text-foreground">Equipamento: </span>
                  {selected.equipmentName}
                </p>
              ) : null}
              {selected.movementPattern ? (
                <p>
                  <span className="font-bold text-foreground">Padrão: </span>
                  {selected.movementPattern}
                </p>
              ) : null}
            </div>
          </article>
        ) : (
          <>
            <p className="text-[13px] font-bold uppercase text-muted">
              {query ? "Resultados da busca" : "Biblioteca"}
            </p>
            {truncated ? (
              <p className="text-sm text-muted">
                Mostrando {visible.length} de {results.length}. Digite o nome ou a categoria para
                filtrar.
              </p>
            ) : null}
            <div className="flex flex-col gap-2.5">
              {visible.length === 0 ? (
                query ? (
                  <p className="text-sm text-muted">Nenhum exercício encontrado para esta busca.</p>
                ) : filter === "favorites" ? (
                  <p className="text-sm text-muted">Nenhum favorito ainda. Toque no coração na ficha.</p>
                ) : null
              ) : (
                visible.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="flex items-center justify-between rounded-[var(--radius-lg)] border border-border bg-surface p-3.5"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedId(exercise.id)}
                      className="flex min-w-0 flex-1 flex-col gap-1 text-left"
                    >
                      <p className="text-sm font-bold text-foreground">{exercise.namePt}</p>
                      {categoryLine(exercise) ? (
                        <p className="text-xs text-muted">{categoryLine(exercise)}</p>
                      ) : null}
                    </button>
                    <button
                      type="button"
                      aria-label={exercise.favorite ? "Remover dos favoritos" : "Favoritar"}
                      onClick={() => toggleFavorite(exercise.id)}
                      className={exercise.favorite ? "text-brand" : "text-muted"}
                    >
                      <FigmaIcon
                        src={exercise.favorite ? "/icons/heart-filled.svg" : "/icons/heart.svg"}
                        alt=""
                        size={20}
                      />
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </AthleteAppShell>
  );
}
