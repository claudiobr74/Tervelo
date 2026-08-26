import Link from "next/link";
import type { ReactNode } from "react";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { BrandLogo } from "@/components/brand/brand-logo";

const PENDING = "FIGMA_PENDING — sem screen no Figma";

export type AdminActive =
  | "Dashboard"
  | "Usuários"
  | "Exercícios"
  | "Equipamentos"
  | "Inventário da Academia"
  | "Inteligência Artificial"
  | "Auditoria";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "/icons/admin/dashboard.svg", pending: false },
  { href: "/admin/users", label: "Usuários", icon: "/icons/admin/users.svg", pending: false },
  { href: null, label: "Treinamento", icon: "/icons/admin/dumbbell.svg", pending: true },
  { href: null, label: "Nutrição", icon: "/icons/admin/nutrition.svg", pending: true },
] as const;

const LIBRARY = [
  { href: "/admin/exercises", label: "Exercícios" },
  { href: "/admin/equipment", label: "Equipamentos" },
  { href: "/admin/inventory", label: "Inventário da Academia" },
] as const;

const AFTER = [
  { href: "/admin/ai", label: "Inteligência Artificial", icon: "/icons/admin/cpu.svg", pending: false },
  { href: null, label: "Configurações", icon: "/icons/admin/settings.svg", pending: true },
  { href: "/admin/audit", label: "Auditoria", icon: "/icons/admin/shield.svg", pending: false },
] as const;

function navClass(selected: boolean): string {
  return `flex items-center gap-3 rounded-[var(--radius-md)] px-4 py-3 text-sm ${
    selected ? "border border-brand bg-brand-soft font-bold text-brand" : "font-medium text-muted"
  }`;
}

export function AdminShell({
  title,
  subtitle,
  active,
  children,
}: {
  title: string;
  subtitle?: string;
  active?: AdminActive;
  children: ReactNode;
}) {
  const current = active;
  const libraryActive =
    current === "Exercícios" || current === "Equipamentos" || current === "Inventário da Academia";

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <aside className="flex w-[260px] shrink-0 flex-col gap-8 border-r border-border px-4 py-6">
        <div className="flex flex-col gap-1">
          <BrandLogo className="h-9 w-auto max-w-[196px]" />
          <p className="text-[10px] font-semibold uppercase text-brand">Admin Console</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1.5">
          {NAV.map((item) => {
            const selected = item.label === current;
            const inner = (
              <>
                <FigmaIcon src={item.icon} alt="" size={18} />
                {item.label}
              </>
            );
            if (item.pending || !item.href) {
              return (
                <span key={item.label} title={PENDING} className={navClass(false)}>
                  {inner}
                </span>
              );
            }
            return (
              <Link key={item.label} href={item.href} className={navClass(selected)}>
                {inner}
              </Link>
            );
          })}
          <div className="flex flex-col gap-1">
            <div className={`flex items-center gap-3 rounded-[var(--radius-md)] px-4 py-3 ${libraryActive ? "text-brand" : "text-muted"}`}>
              <FigmaIcon src="/icons/admin/book.svg" alt="" size={18} />
              <span className={`text-sm ${libraryActive ? "font-semibold text-brand" : "font-medium"}`}>
                Biblioteca
              </span>
            </div>
            {LIBRARY.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`ml-7 rounded-[var(--radius-sm)] px-2 py-1.5 text-sm ${
                  item.label === current ? "font-semibold text-brand" : "text-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          {AFTER.map((item) => {
            const selected = item.label === current;
            const inner = (
              <>
                <FigmaIcon src={item.icon} alt="" size={18} />
                {item.label}
              </>
            );
            if (item.pending || !item.href) {
              return (
                <span key={item.label} title={PENDING} className={navClass(false)}>
                  {inner}
                </span>
              );
            }
            return (
              <Link key={item.label} href={item.href} className={navClass(selected)}>
                {inner}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3 border-t border-border px-2 pt-4">
          <span className="relative size-9 overflow-clip rounded-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/catalog/admin-users/lucas.webp" alt="" width={36} height={36} className="size-full object-cover" />
          </span>
          <div className="flex flex-col">
            <p className="text-sm font-semibold">Lucas Mendes</p>
            <p className="text-xs text-muted">Diretor Técnico</p>
          </div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-border px-8 py-5">
          <div>
            <h1 className="text-[28px] font-extrabold leading-none">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex w-[280px] items-center gap-2 rounded-full border border-border bg-surface px-4 py-2">
              <FigmaIcon src="/icons/admin/search.svg" alt="" size={16} />
              <span className="text-[13px] text-muted">Buscar...</span>
            </div>
            <span className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-surface text-muted">
              <FigmaIcon src="/icons/admin/bell.svg" alt="" size={18} />
            </span>
            <span className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-surface text-muted">
              <FigmaIcon src="/icons/admin/help.svg" alt="" size={18} />
            </span>
          </div>
        </header>
        <div className="min-h-0 flex-1 px-8 py-8">{children}</div>
      </div>
    </div>
  );
}
