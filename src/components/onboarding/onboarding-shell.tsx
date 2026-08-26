import Link from "next/link";
import type { ReactNode } from "react";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { PRIMARY_CTA_CLASS } from "@/components/auth/auth-shell";

export function OnboardingShell({
  step,
  title,
  backHref,
  skipHref,
  children,
  footerNote,
  cta,
  onContinue,
  continueLabel = "Continuar",
}: {
  step: number;
  title: string;
  backHref: string;
  skipHref?: string;
  children: ReactNode;
  footerNote?: string;
  cta?: ReactNode;
  onContinue: () => void;
  continueLabel?: string;
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col justify-between bg-background">
      <div className="flex w-full flex-col">
        <header className="flex flex-col gap-3 px-6 pb-5 pt-4">
          <div className="flex items-center justify-between">
            <Link href={backHref} aria-label="Voltar" className="size-6 text-foreground">
              <FigmaIcon src="/icons/arrow-left.svg" alt="" size={24} />
            </Link>
            <p className="text-sm font-semibold text-brand">Etapa {step} de 5</p>
            {skipHref ? (
              <Link href={skipHref} className="text-sm font-semibold text-muted">
                Pular
              </Link>
            ) : (
              <span className="size-6" />
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">{title}</h1>
        </header>
        <div className="flex flex-col gap-5 px-6">{children}</div>
      </div>
      <div className="flex flex-col items-center gap-3 px-6 pb-8 pt-8">
        {cta ?? (
          <button type="button" onClick={onContinue} className={PRIMARY_CTA_CLASS}>
            {continueLabel}
          </button>
        )}
        {footerNote ? <p className="w-full text-center text-[13px] text-tertiary">{footerNote}</p> : null}
      </div>
    </main>
  );
}

export function ChoiceChip({
  selected,
  children,
  onClick,
  className = "",
}: {
  selected: boolean;
  children: ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center rounded-[var(--radius-lg)] border px-4 py-3 text-sm ${
        selected
          ? "border-brand bg-brand-soft font-bold text-brand"
          : "border-border bg-surface font-semibold text-muted"
      } ${className}`.trim()}
    >
      {children}
    </button>
  );
}

export function ChoiceRow({
  selected,
  children,
  onClick,
}: {
  selected: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-[var(--radius-lg)] border px-4 py-3.5 text-left text-sm ${
        selected
          ? "border-brand bg-brand-soft font-bold text-brand"
          : "border-border bg-surface font-medium text-foreground"
      }`}
    >
      {children}
      <span
        className={`size-[18px] rounded-full border-2 ${
          selected ? "border-brand bg-brand" : "border-border-strong bg-transparent"
        }`}
      />
    </button>
  );
}
