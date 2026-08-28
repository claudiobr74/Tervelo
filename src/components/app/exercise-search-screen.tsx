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
  const selected = results.find((item) => item.id === selectedId) ?? results[0];

  return (
    <AthleteAppShell active="Treino">
      <div className="flex flex-col gap-3 px-6 pb-3 pt-4">
        <h1 className="text-2xl font-extrabold text-foreground">Exercícios</h1>
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
        <p className="text-[13px] font-bold uppercase text-muted">Resultados da busca</p>
        {catalogQuery.loading ? <p className="text-sm text-muted">Consultando o catálogo no banco…</p> : null}
        {catalogQuery.error ? (
          <EmptyPanel title="Banco indisponível" body="A busca só lista exercícios gravados." />
        ) : null}
        {!catalogQuery.loading && !catalogQuery.error && catalog.length === 0 ? (
          <EmptyPanel
            title="Catálogo vazio"
            body="O admin grava exercícios na biblioteca. Esta busca não preenche movimento inventado."
          />
        ) : null}
        <div className="flex flex-col gap-2.5">
          {results.length === 0 ? (
            query ? (
              <p className="text-sm text-muted">Nenhum exercício encontrado para esta busca.</p>
            ) : catalog.length > 0 ? (
              <p className="text-sm text-muted">Digite para filtrar o catálogo gravado.</p>
            ) : null
          ) : (
            results.map((exercise) => (
              <div
                key={exercise.id}
                className={`flex items-center justify-between rounded-[var(--radius-lg)] border bg-surface p-3.5 ${
                  selected?.id === exercise.id ? "border-brand" : "border-border"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedId(exercise.id)}
                  className="flex min-w-0 flex-1 flex-col gap-1 text-left"
                >
                  <p className="text-sm font-bold text-foreground">{exercise.namePt}</p>
                  <p className="text-xs text-muted">
                    {exercise.primaryMuscle} • {exercise.equipmentName}
                  </p>
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
        {selected ? (
          <article className="flex flex-col gap-4 rounded-[var(--radius-xl)] border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-extrabold text-foreground">{selected.namePt}</h2>
              <FigmaIcon
                src={selected.favorite ? "/icons/heart-filled.svg" : "/icons/heart.svg"}
                alt=""
                size={20}
                className={selected.favorite ? "text-brand" : "text-muted"}
              />
            </div>
            {selected.imageSrc ? (
              <span className="relative block h-[140px] w-full overflow-clip rounded-[var(--radius-md)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selected.imageSrc}
                  alt=""
                  width={342}
                  height={140}
                  className="size-full object-cover"
                />
              </span>
            ) : null}
            <div className="flex flex-col gap-2 text-xs text-muted">
              <p>
                <span className="font-bold text-foreground">Músculo Principal: </span>
                {selected.primaryMuscle}
              </p>
              <p>
                <span className="font-bold text-foreground">Secundários: </span>
                {selected.secondaryMuscles.join(", ")}
              </p>
              <p>
                <span className="font-bold text-foreground">Equipamento: </span>
                {selected.equipmentName}
              </p>
              <p>
                <span className="font-bold text-foreground">Padrão: </span>
                {selected.movementPattern}
              </p>
            </div>
          </article>
        ) : null}
      </div>
    </AthleteAppShell>
  );
}
