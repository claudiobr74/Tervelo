"use client";

import { useMemo, useState } from "react";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { AdminShell } from "@/components/admin/admin-shell";
import { searchCatalogExercises } from "@/domain/exercise/search";
import { PREVIEW_EXERCISES } from "@/lib/catalog/preview-catalog";

export function AdminExercisesScreen() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("ex-supino-reto");
  const list = useMemo(() => {
    const adminList = PREVIEW_EXERCISES.filter((item) =>
      [
        "ex-supino-reto",
        "ex-agachamento",
        "ex-puxada-alta",
        "ex-desenvolvimento",
        "ex-elevacao-pelvica",
        "ex-rosca-w",
      ].includes(item.id),
    );
    return searchCatalogExercises(adminList.length ? adminList : PREVIEW_EXERCISES, query);
  }, [query]);
  const selected = list.find((item) => item.id === selectedId) ?? list[0];

  return (
    <AdminShell
      title="Biblioteca de Exercícios"
      subtitle="Padrões de movimento, variações e aparelhos canônicos — sem duplicar fabricante."
      active="Exercícios"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col flex-wrap gap-3 xl:flex-row xl:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-[var(--radius-lg)] border border-border bg-surface px-4 py-3 text-muted">
            <FigmaIcon src="/icons/admin/search.svg" alt="" size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar exercício ou aparelho..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </div>
          <span className="text-sm font-semibold text-brand">{PREVIEW_EXERCISES.length} exercícios cadastrados</span>
          <button
            type="button"
            disabled
            title="Cadastro de exercício em breve"
            className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-lg)] bg-brand px-4 text-sm font-bold text-on-brand opacity-60"
          >
            <FigmaIcon src="/icons/admin/plus.svg" alt="" size={14} />
            Adicionar exercício
          </button>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          {["Grupo muscular: Todos", "Equipamento", "Padrão de movimento", "Unilateral/Bilateral", "Nível", "Peso livre/Máquina"].map(
            (label, index) => (
              <span
                key={label}
                className={`rounded-full border px-3 py-1.5 ${
                  index === 0 ? "border-brand bg-brand-soft text-brand" : "border-border text-muted"
                }`}
              >
                {label}
              </span>
            ),
          )}
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="flex flex-col gap-2">
            {list.map((exercise) => {
              const active = exercise.id === selected?.id;
              return (
                <button
                  key={exercise.id}
                  type="button"
                  onClick={() => setSelectedId(exercise.id)}
                  className={`flex items-center gap-3 rounded-[var(--radius-lg)] border p-3 text-left ${
                    active ? "border-brand bg-surface" : "border-border bg-surface"
                  }`}
                >
                  <span className="relative size-12 shrink-0 overflow-clip rounded-[var(--radius-md)] bg-surface-secondary">
                    {exercise.imageSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={exercise.imageSrc} alt="" className="size-full object-cover" />
                    ) : null}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">{exercise.namePt}</p>
                    <div className="mt-1 flex gap-2 text-xs">
                      <span className="text-brand">{exercise.primaryMuscle}</span>
                      <span className="text-muted">{exercise.movementPattern}</span>
                    </div>
                  </div>
                  <p className="max-w-[7rem] shrink-0 truncate text-xs text-muted">{exercise.equipmentName}</p>
                </button>
              );
            })}
          </div>
          {selected ? (
            <article className="flex flex-col gap-4 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
              <div>
                <h2 className="text-xl font-extrabold">{selected.namePt}</h2>
                <p className="text-[11px] font-semibold uppercase text-muted">
                  Exercício canônico → Variação → Equipamento
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <span className="relative h-32 overflow-clip rounded-[var(--radius-md)] bg-surface-secondary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/catalog/detail-photo.webp" alt="" className="size-full object-cover" />
                </span>
                <span className="relative h-32 overflow-clip rounded-[var(--radius-md)] bg-surface-secondary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selected.imageSrc ?? "/catalog/thumb-supino.webp"} alt="" className="size-full object-cover" />
                </span>
              </div>
              <div className="flex gap-4 text-sm font-semibold">
                {["Execução", "Ajustes", "Erros", "Alternativas"].map((tab, index) => (
                  <span key={tab} className={index === 0 ? "text-brand" : "text-muted"}>
                    {tab}
                  </span>
                ))}
              </div>
              <p className="text-sm text-muted">
                <span className="font-bold text-foreground">Músculo Principal: </span>
                {selected.primaryMuscle}
              </p>
              <p className="text-sm text-muted">
                <span className="font-bold text-foreground">Secundários: </span>
                {selected.secondaryMuscles.join(", ")}
              </p>
              <p className="text-sm leading-5 text-muted">
                Um canônico no catálogo. Fabricantes ficam em modelos de equipamento, não em exercícios
                duplicados.
              </p>
            </article>
          ) : null}
        </div>
      </div>
    </AdminShell>
  );
}
