import Link from "next/link";
import { FigmaIcon } from "@/components/auth/figma-icon";

const TABS = [
  { href: "/app/today", label: "Hoje", icon: "/icons/nav/hoje.svg" },
  { href: "/app/workout", label: "Treino", icon: "/icons/nav/treino.svg" },
  { href: "/app/progress", label: "Evolução", icon: "/icons/nav/evolucao.svg" },
  { href: "/app/coach", label: "Coach", icon: "/icons/nav/coach.svg" },
  { href: "/app/profile", label: "Mais", icon: "/icons/nav/mais.svg" },
] as const;

export function AthleteBottomNav({ active }: { active?: (typeof TABS)[number]["label"] }) {
  return (
    <nav
      aria-label="Navegação principal"
      className="flex h-[72px] items-center justify-between border-t border-border bg-surface px-4"
    >
      {TABS.map((tab) => {
        const selected = tab.label === active;
        const className = `flex w-16 flex-col items-center gap-1 ${
          selected ? "text-brand" : "text-tertiary"
        }`;
        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={className}
            aria-current={selected ? "page" : undefined}
          >
            <FigmaIcon src={tab.icon} alt="" size={22} />
            <span className={`text-[11px] ${selected ? "font-semibold" : "font-normal"}`}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AthleteAppShell({
  children,
  active,
  hideNav = false,
}: {
  children: React.ReactNode;
  active?: (typeof TABS)[number]["label"];
  hideNav?: boolean;
}) {
  return (
    <div className="mx-auto flex h-dvh max-h-dvh w-full max-w-[390px] flex-col overflow-hidden bg-background">
      <main className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto">{children}</main>
      {hideNav ? null : <AthleteBottomNav active={active} />}
    </div>
  );
}
