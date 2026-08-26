import { type HTMLAttributes, type ReactNode } from "react";

type BadgeTone = "brand" | "success" | "warning" | "error" | "neutral";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  children: ReactNode;
};

const TONE_CLASS: Record<BadgeTone, string> = {
  brand: "bg-brand/15 text-brand",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  error: "bg-error/15 text-error",
  neutral: "bg-surface-secondary text-muted",
};

export function Badge({ className = "", tone = "brand", children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-[var(--radius-sm)] px-2 py-0.5 text-[11px] font-medium ${TONE_CLASS[tone]} ${className}`.trim()}
      {...props}
    >
      {children}
    </span>
  );
}
