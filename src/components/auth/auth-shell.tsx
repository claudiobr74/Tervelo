import Link from "next/link";
import type { ReactNode } from "react";

/** Shell mobile 390px; desktop usa o mesmo layout (sem landing inventada). D-016: sem status bar iOS. */
export function AuthShell({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col justify-between bg-background">
      <div className="flex w-full flex-col">{children}</div>
      {footer ? <div className="flex flex-col items-center gap-3 pb-8">{footer}</div> : null}
    </main>
  );
}

export function AuthFooterLink({
  prompt,
  href,
  action,
}: {
  prompt: string;
  href: string;
  action: string;
}) {
  return (
    <p className="flex gap-1 text-sm">
      <span className="font-normal text-muted">{prompt}</span>
      <Link href={href} className="font-bold text-brand">
        {action}
      </Link>
    </p>
  );
}

export function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="w-full text-[12px] font-bold uppercase text-muted">
      {children}
    </label>
  );
}

export const AUTH_INPUT_CLASS =
  "h-auto min-h-[52px] w-full rounded-[var(--radius-lg)] border border-border bg-surface px-4 py-[14px] text-[15px] text-foreground placeholder:text-tertiary outline-none transition-[border-color,box-shadow] duration-200 focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50";

export const PRIMARY_CTA_CLASS =
  "inline-flex h-[52px] w-full items-center justify-center rounded-[var(--radius-lg)] bg-brand text-base font-bold text-on-brand shadow-md transition-colors duration-200 hover:bg-brand-accent disabled:opacity-50";
