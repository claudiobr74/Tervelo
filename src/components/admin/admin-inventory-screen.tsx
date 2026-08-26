"use client";

import { useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { previewGymInventory } from "@/lib/catalog/preview-catalog";
import { expandDumbbellWeights } from "@/domain/gym/dumbbells";
import { plateColorClass } from "@/domain/plates/calculate";

const GROUPS = [
  { id: "chest", label: "Peito", count: 12 },
  { id: "back", label: "Costas", count: 10 },
  { id: "shoulders", label: "Ombros", count: 8 },
  { id: "biceps", label: "Bíceps", count: 6 },
  { id: "triceps", label: "Tríceps", count: 6 },
  { id: "quads", label: "Quadríceps", count: 9 },
  { id: "hams", label: "Posterior", count: 7 },
  { id: "glutes", label: "Glúteos", count: 5 },
] as const;

export function AdminInventoryScreen() {
  const initial = previewGymInventory();
  const [gym] = useState(initial);
  const [group, setGroup] = useState<(typeof GROUPS)[number]["id"]>("chest");
  const [chest, setChest] = useState(initial.chestEquipment);
  const [bars, setBars] = useState(initial.bars);
  const [saved, setSaved] = useState(false);
  const dumbbells = expandDumbbellWeights(gym.dumbbells);

  const plateChips = [...gym.plates].sort((a, b) => a.weightKg - b.weightKg);
  const missingPlates = plateChips.filter((item) => item.quantity === 0);

  return (
    <AdminShell
      title="Inventário da Academia"
      subtitle="Configure o maquinário disponível fisicamente na sua unidade."
      libraryItem="Inventário da Academia"
    >
      <div className="grid grid-cols-[280px_minmax(0,1fr)] gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">{gym.name}</p>
            <button
              type="button"
              disabled
              title="Cadastro de academia do atleta FIGMA_PENDING"
              className="text-xs font-semibold text-brand opacity-60"
            >
              + Adicionar academia
            </button>
          </div>
          <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-4">
            <p className="text-[11px] font-bold uppercase text-muted">Maquinário cadastrado</p>
            <p className="mt-1 text-2xl font-extrabold text-brand">{gym.registeredPercent}%</p>
            <div className="mt-2 h-2 overflow-clip rounded-full bg-surface-secondary">
              <div className="h-full bg-brand" style={{ width: `${gym.registeredPercent}%` }} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            {GROUPS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setGroup(item.id)}
                className={`flex items-center justify-between rounded-[var(--radius-md)] px-3 py-2 text-sm ${
                  item.id === group ? "font-semibold text-brand" : "text-muted"
                }`}
              >
                <span>{item.label}</span>
                <span className="text-xs">{item.count} selecionados</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              disabled
              title="Preset de academia completa FIGMA_PENDING"
              className="rounded-[var(--radius-lg)] border border-brand px-4 py-2 text-sm font-semibold text-brand opacity-60"
            >
              Selecionar academia completa padrão
            </button>
            <button
              type="button"
              onClick={() => setSaved(true)}
              className="rounded-[var(--radius-lg)] bg-brand px-4 py-2 text-sm font-bold text-on-brand"
            >
              {saved ? "Inventário salvo (pré-visualização)" : "Salvar inventário"}
            </button>
          </div>
          {group === "chest" ? (
            <section>
              <h2 className="mb-3 text-sm font-bold">Equipamentos de Peito Disponíveis</h2>
              <div className="flex flex-col gap-2">
                {chest.map((item) => (
                  <label key={item.id} className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-3 text-sm">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() =>
                        setChest((rows) =>
                          rows.map((row) => (row.id === item.id ? { ...row, selected: !row.selected } : row)),
                        )
                      }
                      className="size-4 accent-[var(--brand-primary)]"
                    />
                    {item.name}
                  </label>
                ))}
              </div>
            </section>
          ) : (
            <p className="text-sm text-muted">
              Lista detalhada deste grupo muscular entra com o catálogo completo no Nhost. Peito está no node
              Figma.
            </p>
          )}
          <section>
            <h2 className="mb-3 text-sm font-bold">Anilhas Disponíveis (Quantidade Física)</h2>
            <div className="flex flex-wrap gap-2">
              {plateChips.map((plate) => (
                <div
                  key={plate.weightKg}
                  className={`flex flex-col items-center rounded-[var(--radius-md)] px-3 py-2 ${
                    plate.quantity > 0
                      ? `${plateColorClass(plate.weightKg)} text-on-status`
                      : "border border-brand bg-brand-soft text-brand"
                  }`}
                >
                  <span className="text-sm font-bold">
                    {plate.weightKg.toLocaleString("pt-BR")} kg
                  </span>
                  <span className="text-[11px]">{plate.quantity} un</span>
                </div>
              ))}
            </div>
            {missingPlates.length > 0 ? (
              <p className="mt-2 text-xs text-muted">
                {missingPlates
                  .map((plate) => `${plate.weightKg.toLocaleString("pt-BR")} kg`)
                  .join(", ")}{" "}
                com 0 un — não entram na montagem da barra.
              </p>
            ) : null}
          </section>
          <section>
            <h2 className="mb-3 text-sm font-bold">Barras</h2>
            <div className="flex flex-col gap-2">
              {bars.map((bar) => (
                <label key={bar.id} className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={bar.selected}
                    onChange={() =>
                      setBars((rows) =>
                        rows.map((row) => (row.id === bar.id ? { ...row, selected: !row.selected } : row)),
                      )
                    }
                    className="size-4 accent-[var(--brand-primary)]"
                  />
                  {bar.name} — peso real {bar.actualWeightKg} kg
                </label>
              ))}
            </div>
          </section>
          <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-4">
            <h2 className="mb-2 text-sm font-bold">Halteres (Gama Disponível)</h2>
            {dumbbells.ok ? (
              <p className="text-lg font-extrabold">
                {gym.dumbbells.mode === "range"
                  ? `${gym.dumbbells.minKg} kg até ${gym.dumbbells.maxKg} kg`
                  : dumbbells.value.join(", ")}
              </p>
            ) : null}
            {gym.dumbbells.mode === "range" ? (
              <p className="mt-1 text-sm text-muted">
                Incrementos de {gym.dumbbells.incrementKg} em {gym.dumbbells.incrementKg} kg
              </p>
            ) : null}
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
