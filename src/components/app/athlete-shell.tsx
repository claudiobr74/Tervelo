import Link from "next/link";
import { FigmaIcon } from "@/components/auth/figma-icon";

const TABS = [
  { href: "/", label: "Hoje", icon: "/icons/nav/hoje.svg", enabled: false },
  { href: "/app/exercises", label: "Treino", icon: "/icons/nav/treino.svg", enabled: true },
  { href: "/", label: "Evolução", icon: "/icons/nav/evolucao.svg", enabled: false },
  { href: "/", label: "Coach", icon: "/icons/nav/coach.svg", enabled: false },
  { href: "/", label: "Mais", icon: "/icons/nav/mais.svg", enabled: false },
] as const;

export function AthleteBottomNav({ active = "Treino" }: { active?: (typeof TABS)[number]["label"] }) {
  return (
    <nav className="flex h-[72px] items-center justify-between border-t border-border bg-surface px-4">
      {TABS.map((tab) => {
        const selected = tab.label === active;
        const className = `flex w-16 flex-col items-center gap-1 ${
          selected ? "text-brand" : "text-tertiary"
        }`;
        const inner = (
          <>
            <FigmaIcon src={tab.icon} alt="" size={22} />
            <span className={`text-[11px] ${selected ? "font-semibold" : "font-normal"}`}>{tab.label}</span>
          </>
        );
        if (!tab.enabled) {
          return (
            <span key={tab.label} className={`${className} opacity-70`} title="Tela na Phase 6+">
              {inner}
            </span>
          );
        }
        return (
          <Link key={tab.label} href={tab.href} className={className}>
            {inner}
          </Link>
        );
      })}
    </nav>
  );
}

export function AthleteAppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex h-dvh w-full max-w-[390px] flex-col bg-background">
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto">{children}</div>
      <AthleteBottomNav />
    </div>
  );
}
