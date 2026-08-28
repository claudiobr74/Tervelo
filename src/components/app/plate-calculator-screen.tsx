"use client";

import { useState } from "react";
import Link from "next/link";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { BrandLogo } from "@/components/brand/brand-logo";
import { AthleteAppShell } from "@/components/app/athlete-shell";
import { EmptyPanel } from "@/components/ui/empty-panel";
import { PRIMARY_CTA_CLASS } from "@/components/auth/auth-shell";
import {
  calculatePlates,
  listPlateAssemblies,
  nearestPlateLoads,
  plateColorClass,
} from "@/domain/plates/calculate";
import { adminRequest } from "@/lib/admin/http";
import { useAdminQuery } from "@/lib/admin/use-admin-query";

type InventoryGym = {
  id: string;
  name: string;
  plates: { id: string; weightKg: number; quantity: number }[];
  bars: { id: string; name: string; actualWeightKg: number; quantity: number }[];
};

function formatKg(value: number): string {
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} kg`;
}

export function PlateCalculatorScreen() {
  const inventory = useAdminQuery<{ gyms: InventoryGym[] }>("/api/me/inventory");
  const gym = inventory.data?.gyms[0] ?? null;
  const stock = (gym?.plates ?? []).filter((item) => item.quantity > 0);
  const bar = gym?.bars.find((item) => item.actualWeightKg === 20) ?? gym?.bars[0];
  const [targetKg, setTargetKg] = useState(100);
  const [confirmed, setConfirmed] = useState(false);
  const [plateWeight, setPlateWeight] = useState("20");
  const [plateQty, setPlateQty] = useState("4");
  const [barWeight, setBarWeight] = useState("20");
  const [message, setMessage] = useState<string | null>(null);

  const barKg = bar?.actualWeightKg ?? 20;
  const assemblies = bar
    ? listPlateAssemblies({ targetKg, barKg, stock })
    : { ok: false as const };
  const exact = bar ? calculatePlates({ targetKg, barKg, stock }) : { ok: false as const };
  const nearest =
    bar && !exact.ok ? nearestPlateLoads({ targetKg, barKg, stock }) : null;
  const primary = assemblies.ok ? assemblies.value[0] : null;
  const alternative = assemblies.ok ? assemblies.value[1] : null;
  const missingFine = (gym?.plates ?? []).some(
    (item) => item.weightKg === 1.25 && item.quantity === 0,
  );

  async function addPlate() {
    if (!gym) return;
    setMessage(null);
    const result = await adminRequest("/api/me/inventory", {
      method: "POST",
      body: JSON.stringify({
        kind: "plate",
        gymId: gym.id,
        weightKg: Number(plateWeight),
        quantity: Number(plateQty),
      }),
    });
    if (!result.ok) {
      setMessage("Não gravou a anilha.");
      return;
    }
    await inventory.reload();
  }

  async function addBar() {
    if (!gym) return;
    setMessage(null);
    const result = await adminRequest("/api/me/inventory", {
      method: "POST",
      body: JSON.stringify({
        kind: "bar",
        gymId: gym.id,
        name: `Barra ${barWeight} kg`,
        barKind: "olympic",
        actualWeightKg: Number(barWeight),
        quantity: 1,
      }),
    });
    if (!result.ok) {
      setMessage("Não gravou a barra.");
      return;
    }
    await inventory.reload();
  }

  return (
    <AthleteAppShell active="Treino">
      <header className="flex flex-col gap-3 px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/app/exercises" aria-label="Voltar" className="size-6 text-foreground">
            <FigmaIcon src="/icons/arrow-left.svg" alt="" size={24} />
          </Link>
          <BrandLogo className="h-7 w-auto max-w-[140px]" />
          <span className="size-6" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-[22px] font-extrabold text-foreground">Montagem da Barra</h1>
          <p className="text-sm text-muted">Calculadora de carga com o estoque de anilhas.</p>
        </div>
      </header>
      <div className="flex flex-col gap-5 px-6 pb-6">
        {inventory.loading ? <p className="text-sm text-muted">Consultando o inventário…</p> : null}
        {inventory.error ? (
          <EmptyPanel title="Banco indisponível" body="A montagem usa só anilhas gravadas da academia." />
        ) : null}
        {!inventory.loading && !inventory.error && !gym ? (
          <EmptyPanel
            title="Nenhuma academia"
            body="Cadastre a academia e o estoque de anilhas. Esta tela não usa inventário de exemplo."
          />
        ) : null}
        {gym && !bar ? (
          <form
            className="flex flex-col gap-2 rounded-[var(--radius-xl)] border border-border bg-surface p-4"
            onSubmit={(event) => {
              event.preventDefault();
              void addBar();
            }}
          >
            <p className="text-sm font-semibold">Cadastrar barra</p>
            <label className="text-xs">
              Peso da barra (kg)
              <input
                value={barWeight}
                onChange={(event) => setBarWeight(event.target.value)}
                className="mt-1 w-full rounded-[var(--radius-md)] border border-border px-3 py-2"
              />
            </label>
            <button type="submit" className="text-sm font-bold text-brand">
              Gravar barra
            </button>
          </form>
        ) : null}
        {gym && stock.length === 0 ? (
          <form
            className="flex flex-col gap-2 rounded-[var(--radius-xl)] border border-border bg-surface p-4"
            onSubmit={(event) => {
              event.preventDefault();
              void addPlate();
            }}
          >
            <p className="text-sm font-semibold">Cadastrar anilha</p>
            <label className="text-xs">
              Peso (kg)
              <input
                value={plateWeight}
                onChange={(event) => setPlateWeight(event.target.value)}
                className="mt-1 w-full rounded-[var(--radius-md)] border border-border px-3 py-2"
              />
            </label>
            <label className="text-xs">
              Quantidade
              <input
                value={plateQty}
                onChange={(event) => setPlateQty(event.target.value)}
                className="mt-1 w-full rounded-[var(--radius-md)] border border-border px-3 py-2"
              />
            </label>
            <button type="submit" className="text-sm font-bold text-brand">
              Gravar anilha
            </button>
          </form>
        ) : null}
        {message ? <p className="text-sm text-error">{message}</p> : null}
        {gym && bar ? (
          <>
          <div className="flex items-center justify-between rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <div className="flex flex-col gap-1">
            <label htmlFor="target" className="text-xs font-bold uppercase text-muted">
              Carga Alvo
            </label>
            <div className="flex items-baseline gap-2">
              <input
                id="target"
                type="number"
                min={barKg}
                step={0.5}
                value={targetKg}
                onChange={(event) => {
                  setConfirmed(false);
                  setTargetKg(Number(event.target.value));
                }}
                className="w-24 bg-transparent text-[32px] font-extrabold text-brand outline-none"
              />
              <span className="text-lg font-extrabold text-brand">kg</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-0.5 text-xs text-muted">
            <p>Barra: {formatKg(barKg)}</p>
            <p>Carga em Anilhas: {formatKg(Math.max(0, targetKg - barKg))}</p>
          </div>
        </div>

        {primary ? (
          <div className="flex flex-col items-center gap-3 rounded-[var(--radius-xl)] border border-border bg-surface p-4">
            <p className="text-[13px] font-bold uppercase text-foreground">Diagrama de Montagem</p>
            <div className="w-full overflow-x-auto">
              <div className="flex min-w-0 items-center justify-center gap-1">
                <span className="h-2 w-8 shrink-0 rounded-sm bg-border-strong" />
                <div className="flex items-center gap-0.5">
                  {primary.perSide.map((plate) =>
                    Array.from({ length: plate.count }).map((_, index) => (
                      <span
                        key={`L-${plate.weightKg}-${index}`}
                        className={`h-20 w-5 shrink-0 rounded ${plateColorClass(plate.weightKg)}`}
                      />
                    )),
                  )}
                </div>
                <span className="h-3 w-[100px] shrink-0 rounded bg-surface-pressed" />
                <div className="flex items-center gap-0.5">
                  {[...primary.perSide]
                    .reverse()
                    .map((plate) =>
                      Array.from({ length: plate.count }).map((_, index) => (
                        <span
                          key={`R-${plate.weightKg}-${index}`}
                          className={`h-20 w-5 shrink-0 rounded ${plateColorClass(plate.weightKg)}`}
                        />
                      )),
                    )}
                </div>
                <span className="h-2 w-8 shrink-0 rounded-sm bg-border-strong" />
              </div>
            </div>
            <div className="flex w-full justify-between pt-2 text-[13px] font-bold text-foreground">
              <p>{formatKg(primary.perSideKg)} por lado</p>
              <p>{formatKg(primary.perSideKg)} por lado</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <p className="text-[13px] text-muted">Lado:</p>
              {primary.perSide.flatMap((plate) =>
                Array.from({ length: plate.count }).map((_, index) => (
                  <span
                    key={`tag-${plate.weightKg}-${index}`}
                    className={`rounded px-2 py-1 text-[11px] font-bold text-foreground ${plateColorClass(plate.weightKg)}`}
                  >
                    {formatKg(plate.weightKg)}
                  </span>
                )),
              )}
            </div>
          </div>
        ) : null}

        {nearest ? (
          <div className="flex items-center gap-2.5 rounded-[var(--radius-lg)] border border-brand bg-brand-soft p-3 text-brand">
            <FigmaIcon src="/icons/alert-triangle.svg" alt="" size={16} />
            <p className="flex-1 text-xs text-foreground">
              Carga impossível neste inventário — Alternativa mais próxima:{" "}
              {nearest.below ? (
                <span className="font-bold">{formatKg(nearest.below.targetKg)}</span>
              ) : null}
              {nearest.below && nearest.above ? " ou " : null}
              {nearest.above ? (
                <span className="font-bold">{formatKg(nearest.above.targetKg)}</span>
              ) : null}
              .
            </p>
          </div>
        ) : null}

        {missingFine && exact.ok ? (
          <div className="flex items-center gap-2.5 rounded-[var(--radius-lg)] border border-brand bg-brand-soft p-3 text-brand">
            <FigmaIcon src="/icons/alert-triangle.svg" alt="" size={16} />
            <p className="flex-1 text-xs text-foreground">
              Anilha de 1,25 kg não disponível neste ginásio. A montagem usa só o estoque real.
            </p>
          </div>
        ) : null}

        {alternative ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-bold text-muted">Outras montagens possíveis</p>
            <div className="flex items-center justify-between rounded-[var(--radius-lg)] border border-border bg-surface p-3.5">
              <div className="flex flex-col gap-0.5">
                <p className="text-[13px] font-bold text-foreground">Opção 2</p>
                <p className="text-xs text-muted">Baseado nas anilhas da sua academia</p>
              </div>
              <p className="text-[13px] font-bold text-brand">
                {alternative.perSide
                  .flatMap((plate) =>
                    Array.from({ length: plate.count }, () => `[${plate.weightKg}kg]`),
                  )
                  .join(" ")}{" "}
                p/ lado
              </p>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          className={PRIMARY_CTA_CLASS}
          disabled={!primary}
          onClick={() => setConfirmed(true)}
        >
          {confirmed ? "Carga confirmada" : "Confirmar carga"}
        </button>
          </>
        ) : null}
      </div>
    </AthleteAppShell>
  );
}
