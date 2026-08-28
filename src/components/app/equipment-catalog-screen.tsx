"use client";

import { useState } from "react";
import Link from "next/link";
import { AthleteAppShell } from "@/components/app/athlete-shell";
import { EmptyPanel } from "@/components/ui/empty-panel";
import { adminRequest } from "@/lib/admin/http";
import { useAdminQuery } from "@/lib/admin/use-admin-query";
import type { CatalogEquipment } from "@/lib/catalog/preview-catalog";

type CatalogData = { exercises: unknown[]; equipment: CatalogEquipment[] };
type InventoryGym = {
  id: string;
  name: string;
  equipment: { id: string; equipment_id: string; quantity: number; is_available: boolean }[];
};
type InventoryData = { gyms: InventoryGym[] };

export function EquipmentCatalogScreen() {
  const catalog = useAdminQuery<CatalogData>("/api/me/catalog");
  const inventory = useAdminQuery<InventoryData>("/api/me/inventory");
  const [gymId, setGymId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const equipment = catalog.data?.equipment ?? [];
  const gyms = inventory.data?.gyms ?? [];
  const activeGym = gyms.find((gym) => gym.id === gymId) ?? gyms[0];

  async function addToGym(equipmentId: string) {
    setMessage(null);
    const target = activeGym?.id;
    if (!target) {
      setMessage("Cadastre uma academia antes de vincular equipamento.");
      return;
    }
    const result = await adminRequest("/api/me/inventory", {
      method: "POST",
      body: JSON.stringify({ kind: "equipment", gymId: target, equipmentId, quantity: 1 }),
    });
    if (!result.ok) {
      setMessage(
        result.error === "nhost_unavailable"
          ? "Sem banco para gravar o equipamento."
          : "Não vinculou o equipamento.",
      );
      return;
    }
    await inventory.reload();
  }

  return (
    <AthleteAppShell active="Mais">
      <div className="flex flex-col gap-5 px-6 pb-8 pt-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-extrabold text-foreground">Equipamentos</h1>
          <Link href="/app/profile/academia" className="text-sm font-semibold text-brand">
            Academia
          </Link>
        </div>
        {catalog.loading ? <p className="text-sm text-muted">Consultando o banco…</p> : null}
        {catalog.error ? (
          <EmptyPanel
            title="Banco indisponível"
            body="O catálogo só lista equipamentos gravados."
          />
        ) : null}
        {!catalog.loading && !catalog.error && equipment.length === 0 ? (
          <EmptyPanel
            title="Catálogo vazio"
            body="O admin grava equipamentos na biblioteca. Esta tela não preenche máquina inventada."
          />
        ) : null}
        {gyms.length > 0 ? (
          <label className="text-sm font-semibold">
            Academia para vincular
            <select
              value={activeGym?.id ?? ""}
              onChange={(event) => setGymId(event.target.value)}
              className="mt-1 w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-sm"
            >
              {gyms.map((gym) => (
                <option key={gym.id} value={gym.id}>
                  {gym.name}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <EmptyPanel
            title="Sem academia"
            body="Cadastre a unidade em Academia e equipamentos para vincular o que existe lá."
          />
        )}
        <ul className="flex flex-col gap-2">
          {equipment.map((item) => {
            const linked = activeGym?.equipment.some((row) => row.equipment_id === item.id);
            return (
              <li
                key={item.id}
                className="flex items-start justify-between gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold">{item.namePt}</p>
                  <p className="text-xs text-muted">
                    {[item.category, item.resistance, item.increment && `passo ${item.increment}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void addToGym(item.id)}
                  className="shrink-0 text-xs font-bold text-brand"
                >
                  {linked ? "Já na academia" : "Vincular"}
                </button>
              </li>
            );
          })}
        </ul>
        {message ? <p className="text-sm text-error">{message}</p> : null}
      </div>
    </AthleteAppShell>
  );
}
