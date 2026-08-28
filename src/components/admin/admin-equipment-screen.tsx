"use client";

import { useMemo, useState } from "react";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminStatusPanel } from "@/components/admin/admin-status-panel";
import { adminRequest } from "@/lib/admin/http";
import { useAdminQuery } from "@/lib/admin/use-admin-query";

type Equipment = {
  id: string;
  name_pt: string;
  resistance_system: string | null;
  starting_load_kg: number | null;
  increment_kg: number | null;
  category_id: string | null;
};
type Category = { id: string; slug: string; name_pt: string };

export function AdminEquipmentScreen() {
  const { loading, data, error, reload } = useAdminQuery<{
    equipment: Equipment[];
    equipment_categories: Category[];
  }>("/api/admin/equipment");
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<string | "all">("all");
  const [namePt, setNamePt] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const list = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("pt-BR");
    return (data?.equipment ?? []).filter((item) => {
      if (categoryId !== "all" && item.category_id !== categoryId) return false;
      if (needle && !item.name_pt.toLocaleLowerCase("pt-BR").includes(needle)) return false;
      return true;
    });
  }, [data, query, categoryId]);
  const selected = list.find((item) => item.id === selectedId) ?? list[0];

  async function addEquipment() {
    setMessage(null);
    const result = await adminRequest("/api/admin/equipment", {
      method: "POST",
      body: JSON.stringify({
        namePt,
        categoryId: categoryId === "all" ? undefined : categoryId,
      }),
    });
    if (!result.ok) {
      setMessage("Não gravou o equipamento no banco.");
      return;
    }
    setNamePt("");
    await reload();
  }

  return (
    <AdminShell
      title="Biblioteca de Equipamentos"
      subtitle="Aparelhos cadastrados no Nhost."
      active="Equipamentos"
    >
      <div className="flex flex-col gap-4">
        <div className="flex min-w-0 items-center gap-2 rounded-[var(--radius-lg)] border border-border bg-surface px-4 py-3">
          <FigmaIcon src="/icons/admin/search.svg" alt="" size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar equipamento..."
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategoryId("all")}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              categoryId === "all" ? "border-brand bg-brand-soft text-brand" : "border-border"
            }`}
          >
            Todas
          </button>
          {(data?.equipment_categories ?? []).map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setCategoryId(category.id)}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                categoryId === category.id
                  ? "border-brand bg-brand-soft text-brand"
                  : "border-border"
              }`}
            >
              {category.name_pt}
            </button>
          ))}
        </div>
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void addEquipment();
          }}
        >
          <label className="text-sm font-semibold">
            Novo equipamento
            <input
              value={namePt}
              onChange={(event) => setNamePt(event.target.value)}
              className="mt-1 block rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            className="h-11 rounded-[var(--radius-md)] bg-brand px-4 text-sm font-bold text-on-brand"
          >
            Adicionar equipamento
          </button>
        </form>
        {message ? <p className="text-sm text-error">{message}</p> : null}
        <AdminStatusPanel
          loading={loading}
          error={error}
          empty={!loading && !error && list.length === 0}
          emptyTitle="Nenhum equipamento no banco"
          emptyBody="A biblioteca só lista linhas de equipment."
        />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="flex flex-col gap-2">
            {list.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`rounded-[var(--radius-lg)] border p-3 text-left ${
                  item.id === selected?.id ? "border-brand bg-surface" : "border-border bg-surface"
                }`}
              >
                <p className="text-sm font-bold">{item.name_pt}</p>
                <p className="text-xs text-muted">
                  {item.resistance_system || "Resistência não informada"}
                </p>
              </button>
            ))}
          </div>
          {selected ? (
            <article className="rounded-[var(--radius-xl)] border border-border bg-surface p-5 text-sm">
              <h2 className="text-xl font-extrabold">{selected.name_pt}</h2>
              <p className="mt-2">Resistência: {selected.resistance_system ?? "—"}</p>
              <p>Carga inicial: {selected.starting_load_kg ?? "—"} kg</p>
              <p>Incremento: {selected.increment_kg ?? "—"} kg</p>
            </article>
          ) : null}
        </div>
      </div>
    </AdminShell>
  );
}
