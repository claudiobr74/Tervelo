"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AthleteAppShell } from "@/components/app/athlete-shell";
import { EmptyPanel } from "@/components/ui/empty-panel";
import { FigmaIcon } from "@/components/auth/figma-icon";

const TABS = ["Força", "Visão Geral", "Volume", "Exercícios", "Medidas"] as const;
type ProgressTab = (typeof TABS)[number];

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-[var(--radius-md)] px-3 py-2 text-[11px] font-bold ${
        active ? "bg-brand text-on-brand" : "border border-border bg-surface text-muted"
      }`}
    >
      {label}
    </button>
  );
}

export function ProgressScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<ProgressTab>("Força");

  function selectTab(next: ProgressTab) {
    if (next === "Medidas") {
      router.push("/app/body");
      return;
    }
    setTab(next);
  }

  const empty =
    tab === "Força"
      ? {
          title: "Sem histórico de força",
          body: "Quando houver cargas registradas, a progressão aparece aqui. Nada é inventado.",
        }
      : tab === "Volume"
        ? {
            title: "Sem histórico de volume",
            body: "O volume de carga só entra depois de treinos realmente registrados.",
          }
        : tab === "Exercícios"
          ? {
              title: "Sem exercícios acompanhados",
              body: "Os exercícios com histórico entram nesta aba depois da primeira sessão.",
            }
          : {
              title: "Sem evolução ainda",
              body: "Aderência, força e volume só aparecem com treinos seus — não de um atleta de exemplo.",
            };

  return (
    <AthleteAppShell active="Evolução">
      <div className="flex flex-col gap-5 px-6 pb-6 pt-4">
        <header className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold text-foreground">Evolução</h1>
            <FigmaIcon src="/icons/trending-up.svg" alt="" size={24} className="text-foreground" />
          </div>
          <p className="text-[13px] font-medium text-muted">
            Acompanhamento detalhado do seu progresso
          </p>
        </header>

        <div className="flex gap-2 overflow-x-auto">
          {TABS.map((item) => (
            <Chip key={item} label={item} active={tab === item} onClick={() => selectTab(item)} />
          ))}
        </div>

        <EmptyPanel title={empty.title} body={empty.body} />
      </div>
    </AthleteAppShell>
  );
}
