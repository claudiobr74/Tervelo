import Link from "next/link";
import type { ReactNode } from "react";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { BrandLogo } from "@/components/brand/brand-logo";

const PENDING = "FIGMA_PENDING — tela na Phase 10";

const NAV = [
  { href: null, label: "Dashboard", icon: "/icons/admin/dashboard.svg", pending: true },
  { href: null, label: "Usuários", icon: "/icons/admin/users.svg", pending: true },
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
  { href: null, label: "Auditoria", icon: "/icons/admin/shield.svg", pending: true },
] as const;

export function AdminShell({
  title,
  subtitle,
  libraryItem,
  children,
}: {
  title: string;
  subtitle?: string;
  libraryItem?: (typeof LIBRARY)[number]["label"] | "Inteligência Artificial";
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <aside className="flex w-[260px] shrink-0 flex-col gap-7 border-r border-border px-4 py-6">
        <div className="flex flex-col gap-1">
          <BrandLogo className="h-9 w-auto max-w-[196px]" />
          <p className="text-[10px] font-semibold uppercase text-brand">Admin Console</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1.5">
          {NAV.map((item) => (
            <span
              key={item.label}
              title={PENDING}
              className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium text-muted"
            >
              <FigmaIcon src={item.icon} alt="" size={18} />
              {item.label}
            </span>
          ))}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 rounded-[var(--radius-md)] bg-brand-soft px-3 py-2.5 text-brand">
              <FigmaIcon src="/icons/admin/book.svg" alt="" size={18} />
              <span className="text-sm font-semibold text-brand">Biblioteca</span>
            </div>
            {LIBRARY.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`ml-7 rounded-[var(--radius-sm)] px-2 py-1.5 text-sm ${
                  item.label === libraryItem ? "font-semibold text-brand" : "text-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          {AFTER.map((item) => {
            const selected = item.label === libraryItem;
            const className = `flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm ${
              selected ? "border border-brand bg-brand-soft font-bold text-brand" : "font-medium text-muted"
            }`;
            const inner = (
              <>
                <FigmaIcon src={item.icon} alt="" size={18} />
                {item.label}
              </>
            );
            if (item.pending || !item.href) {
              return (
                <span key={item.label} title={PENDING} className={className}>
                  {inner}
                </span>
              );
            }
            return (
              <Link key={item.label} href={item.href} className={className}>
                {inner}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3 px-2">
          <span className="relative size-9 overflow-clip rounded-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/catalog/admin-avatar.webp" alt="" width={36} height={36} className="size-full object-cover" />
          </span>
          <div className="flex flex-col">
            <p className="text-sm font-semibold">Lucas Mendes</p>
            <p className="text-xs text-muted">Diretor Técnico</p>
          </div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 px-8 py-5">
          <div>
            <h1 className="text-2xl font-extrabold">{title}</h1>
            {subtitle ? <p className="text-sm text-muted">{subtitle}</p> : null}
          </div>
          <div className="flex items-center gap-3 text-muted">
            <div className="flex w-56 items-center gap-2 rounded-[var(--radius-lg)] border border-border bg-surface px-3 py-2">
              <FigmaIcon src="/icons/admin/search.svg" alt="" size={16} />
              <span className="text-sm text-tertiary">Buscar...</span>
            </div>
            <FigmaIcon src="/icons/admin/bell.svg" alt="" size={18} />
            <FigmaIcon src="/icons/admin/help.svg" alt="" size={18} />
          </div>
        </header>
        <div className="min-h-0 flex-1 px-8 pb-8">{children}</div>
      </div>
    </div>
  );
}
