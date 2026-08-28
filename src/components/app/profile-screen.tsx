"use client";

import Link from "next/link";
import { AthleteAppShell } from "@/components/app/athlete-shell";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { LogoutButton } from "@/components/auth/logout-button";
import { InitialsAvatar } from "@/components/ui/initials-avatar";
import { useOnboardingDraft } from "@/components/onboarding/onboarding-provider";
import { athleteDisplayName, initialsFromName } from "@/domain/athlete/display-name";

const ITEMS: ({ label: string; href: string } | { label: string; pending: true })[] = [
  { label: "Dados pessoais", href: "/app/profile/pessoais" },
  { label: "Objetivos", href: "/app/profile/objetivos" },
  { label: "Academia e equipamentos", pending: true },
  { label: "Disponibilidade", href: "/app/profile/disponibilidade" },
  { label: "Preferências de treino", href: "/app/profile/preferencias" },
  { label: "Limitações", href: "/app/profile/limitacoes" },
  { label: "Nutrição", href: "/app/nutrition" },
  { label: "Privacidade", pending: true },
  { label: "Notificações", pending: true },
  { label: "Conta", href: "/app/settings" },
];

function MenuRow({ label }: { label: string }) {
  return (
    <>
      <span className="text-sm font-medium text-foreground">{label}</span>
      <FigmaIcon src="/icons/chevron-right.svg" alt="" size={16} className="text-muted" />
    </>
  );
}

export function ProfileScreen({ sessionName = null }: { sessionName?: string | null }) {
  const { draft } = useOnboardingDraft();
  const name = athleteDisplayName(draft.displayName, sessionName);
  const heading = name || "Atleta";

  return (
    <AthleteAppShell active="Mais">
      <div className="flex flex-col">
        <div className="flex flex-col items-center gap-4 px-6 pb-5 pt-6">
          <InitialsAvatar name={initialsFromName(heading)} size={80} />
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-xl font-extrabold text-foreground">{heading}</h1>
          </div>
        </div>
        <nav aria-label="Mais opções" className="flex flex-col gap-2.5 px-6 pb-6">
          {ITEMS.map((item) =>
            "pending" in item ? (
              <button
                key={item.label}
                type="button"
                disabled
                aria-label={`${item.label} — em breve`}
                className="flex w-full items-center justify-between rounded-[var(--radius-lg)] border border-border bg-surface p-4 text-left opacity-60"
              >
                <span className="text-sm font-medium text-foreground">{item.label}</span>
                <span className="text-[11px] font-semibold uppercase text-muted">Em breve</span>
              </button>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between rounded-[var(--radius-lg)] border border-border bg-surface p-4"
              >
                <MenuRow label={item.label} />
              </Link>
            ),
          )}
          <div className="pt-2">
            <LogoutButton variant="block" />
          </div>
        </nav>
      </div>
    </AthleteAppShell>
  );
}
