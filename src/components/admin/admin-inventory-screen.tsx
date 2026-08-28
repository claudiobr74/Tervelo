"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminStatusPanel } from "@/components/admin/admin-status-panel";
import { adminRequest } from "@/lib/admin/http";
import { useAdminQuery } from "@/lib/admin/use-admin-query";

type Gym = { id: string; name: string; notes: string | null; owner_user_id: string };
type Inventory = {
  gyms: Gym[];
  gym_plates: { id: string; weight_kg: number; quantity: number }[];
  gym_bars: {
    id: string;
    name: string | null;
    actual_weight_kg: number;
    bar_kind: string;
    quantity: number;
  }[];
};

export function AdminInventoryScreen() {
  const gymsQuery = useAdminQuery<{ gyms: Gym[] }>("/api/admin/gyms");
  const [gymId, setGymId] = useState<string>("");
  const inventory = useAdminQuery<Inventory>(gymId ? `/api/admin/inventory?gymId=${gymId}` : "");
  const [weight, setWeight] = useState("20");
  const [quantity, setQuantity] = useState("2");
  const [barName, setBarName] = useState("Olímpica");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!gymId && gymsQuery.data?.gyms[0]) setGymId(gymsQuery.data.gyms[0].id);
  }, [gymId, gymsQuery.data]);

  const plates = inventory.data?.gym_plates ?? [];
  const bars = inventory.data?.gym_bars ?? [];

  async function savePlate() {
    if (!gymId) return;
    setMessage(null);
    const result = await adminRequest("/api/admin/inventory", {
      method: "POST",
      body: JSON.stringify({
        gymId,
        weightKg: Number(weight),
        quantity: Number(quantity),
      }),
    });
    setMessage(result.ok ? "Anilha gravada." : "Não gravou a anilha.");
    if (result.ok) await inventory.reload();
  }

  async function saveBar() {
    if (!gymId) return;
    setMessage(null);
    const result = await adminRequest("/api/admin/inventory", {
      method: "POST",
      body: JSON.stringify({
        kind: "bar",
        gymId,
        name: barName,
        actualWeightKg: 20,
        barKind: "olympic",
      }),
    });
    setMessage(result.ok ? "Barra gravada." : "Não gravou a barra.");
    if (result.ok) await inventory.reload();
  }

  return (
    <AdminShell
      title="Inventário da Academia"
      subtitle="Quantidades físicas no Nhost. Sem academia cadastrada, não há o que salvar."
      active="Inventário da Academia"
    >
      <div className="flex flex-col gap-6">
        <label className="text-sm font-semibold">
          Academia
          <select
            value={gymId}
            onChange={(event) => setGymId(event.target.value)}
            className="mt-1 block w-full max-w-sm rounded-[var(--radius-md)] border border-border bg-background px-3 py-2"
          >
            {(gymsQuery.data?.gyms ?? []).map((gym) => (
              <option key={gym.id} value={gym.id}>
                {gym.name}
              </option>
            ))}
          </select>
        </label>
        <AdminStatusPanel
          loading={gymsQuery.loading || inventory.loading}
          error={gymsQuery.error ?? (gymId ? inventory.error : null)}
          empty={!gymsQuery.loading && (gymsQuery.data?.gyms.length ?? 0) === 0}
          emptyTitle="Cadastre uma academia"
          emptyBody="Crie a unidade em Configurações. O inventário grava gym_plates e gym_bars."
        />
        {gymId ? (
          <>
            <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
              <h2 className="text-sm font-bold">Anilhas</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {plates.map((plate) => (
                  <span
                    key={plate.id}
                    className="rounded-[var(--radius-md)] border border-border px-3 py-2 text-sm"
                  >
                    {Number(plate.weight_kg).toLocaleString("pt-BR")} kg · {plate.quantity} un
                  </span>
                ))}
              </div>
              <form
                className="mt-4 flex flex-wrap items-end gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  void savePlate();
                }}
              >
                <label className="text-sm">
                  kg
                  <input
                    value={weight}
                    onChange={(event) => setWeight(event.target.value)}
                    className="ml-2 w-20 rounded border border-border px-2 py-1"
                  />
                </label>
                <label className="text-sm">
                  un
                  <input
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    className="ml-2 w-16 rounded border border-border px-2 py-1"
                  />
                </label>
                <button
                  type="submit"
                  className="rounded bg-brand px-3 py-2 text-sm font-bold text-on-brand"
                >
                  Gravar anilha
                </button>
              </form>
            </section>
            <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
              <h2 className="text-sm font-bold">Barras</h2>
              <ul className="mt-3 flex flex-col gap-1 text-sm">
                {bars.map((bar) => (
                  <li key={bar.id}>
                    {bar.name || bar.bar_kind} · {Number(bar.actual_weight_kg)} kg
                  </li>
                ))}
              </ul>
              <form
                className="mt-4 flex flex-wrap items-end gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  void saveBar();
                }}
              >
                <input
                  value={barName}
                  onChange={(event) => setBarName(event.target.value)}
                  className="rounded border border-border px-2 py-1 text-sm"
                  aria-label="Nome da barra"
                />
                <button
                  type="submit"
                  className="rounded bg-brand px-3 py-2 text-sm font-bold text-on-brand"
                >
                  Gravar barra
                </button>
              </form>
            </section>
          </>
        ) : null}
        {message ? <p className="text-sm">{message}</p> : null}
      </div>
    </AdminShell>
  );
}
