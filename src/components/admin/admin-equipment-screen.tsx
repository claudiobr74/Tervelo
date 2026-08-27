"use client";

import { useMemo, useState } from "react";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { AdminShell } from "@/components/admin/admin-shell";
import { EQUIPMENT_CATEGORIES, PREVIEW_EQUIPMENT } from "@/lib/catalog/preview-catalog";
import { normalizeSearchText } from "@/domain/exercise/aliases";

export function AdminEquipmentScreen() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof EQUIPMENT_CATEGORIES)[number]>("M. Seletorizadas");
  const [selectedId, setSelectedId] = useState("eq-chest-press");
  const list = useMemo(() => {
    const needle = normalizeSearchText(query);
    return PREVIEW_EQUIPMENT.filter((item) => {
      if (item.category !== category) return false;
      if (!needle) return true;
      return normalizeSearchText(`${item.namePt} ${item.muscles} ${item.manufacturers.join(" ")}`).includes(
        needle,
      );
    });
  }, [query, category]);
  const selected = list.find((item) => item.id === selectedId) ?? list[0];

  return (
    <AdminShell
      title="Biblioteca de Equipamentos"
      subtitle="Anatomia biomecânica dos aparelhos de musculação"
      active="Equipamentos"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-[var(--radius-lg)] border border-border bg-surface px-4 py-3 text-muted">
            <FigmaIcon src="/icons/admin/search.svg" alt="" size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar equipamento..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </div>
          <span className="text-sm font-semibold text-brand">
            {PREVIEW_EQUIPMENT.length} equipamentos cadastrados
          </span>
          <button
            type="button"
            disabled
            title="Formulário de criação FIGMA_PENDING"
            className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-lg)] bg-brand px-4 text-sm font-bold text-on-brand opacity-60"
          >
            <FigmaIcon src="/icons/admin/plus.svg" alt="" size={14} />
            Adicionar equipamento
          </button>
        </div>
        <div className="grid grid-cols-[220px_minmax(0,1fr)_minmax(0,1.1fr)] gap-4">
          <div className="flex flex-col gap-1">
            {EQUIPMENT_CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-[var(--radius-md)] px-3 py-2 text-left text-sm ${
                  item === category ? "font-semibold text-brand" : "text-muted"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {list.length === 0 ? (
              <p className="text-sm text-muted">Nenhum equipamento nesta categoria na pré-visualização.</p>
            ) : (
              list.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`flex gap-3 rounded-[var(--radius-lg)] border p-3 text-left ${
                    item.id === selected?.id ? "border-brand bg-surface" : "border-border bg-surface"
                  }`}
                >
                  <span className="relative size-14 shrink-0 overflow-clip rounded-[var(--radius-md)] bg-surface-secondary">
                    {item.imageSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageSrc} alt="" className="size-full object-cover" />
                    ) : null}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold">{item.namePt}</p>
                    <p className="text-xs text-muted">{item.muscles}</p>
                    <p className="text-xs text-muted">
                      {item.resistance} · {item.adjustments} ajustes · {item.range}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
          {selected ? (
            <article className="flex flex-col gap-3 rounded-[var(--radius-xl)] border border-border bg-surface p-5 text-sm">
              <h2 className="text-xl font-extrabold">{selected.namePt}</h2>
              <p>
                <span className="font-bold">Nome Canônico: </span>
                {selected.namePt}
              </p>
              <p>
                <span className="font-bold">Tipo Resistência: </span>
                {selected.resistance}
              </p>
              <p>
                <span className="font-bold">Músculos Ativados: </span>
                {selected.muscles}
              </p>
              <p>
                <span className="font-bold">Sistema Carregamento: </span>
                {selected.loadingSystem}
              </p>
              <p>
                <span className="font-bold">Incrementos de Carga: </span>
                {selected.increment}
              </p>
              <p>
                <span className="font-bold">Faixa de Resistência: </span>
                {selected.range}
              </p>
              <div>
                <p className="mb-2 font-bold">Fabricantes conhecidos</p>
                <div className="flex flex-wrap gap-2">
                  {selected.manufacturers.map((name) => (
                    <span key={name} className="rounded-full border border-border px-3 py-1 text-xs text-muted">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ) : null}
        </div>
      </div>
    </AdminShell>
  );
}
