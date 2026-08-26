import { type HTMLAttributes, type ReactNode } from "react";

type CardVariant = "default" | "elevated" | "interactive";
type CardPadding = "sm" | "md" | "lg";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
  padding?: CardPadding;
  children: ReactNode;
};

const VARIANT_CLASS: Record<CardVariant, string> = {
  default: "bg-surface border-border",
  elevated: "bg-elevated border-border shadow-[var(--shadow-md)]",
  interactive:
    "bg-surface border-border hover:bg-surface-hover hover:border-border-strong cursor-pointer",
};

const PADDING_CLASS: Record<CardPadding, string> = {
  sm: "p-3",
  md: "p-5",
  lg: "p-6",
};

export function Card({
  className = "",
  variant = "default",
  padding = "md",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-[var(--radius-lg)] border transition-[background-color,border-color] duration-200 ${VARIANT_CLASS[variant]} ${PADDING_CLASS[padding]} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h3 className="text-base font-semibold text-foreground">{children}</h3>;
}

export function CardBody({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted">{children}</p>;
}
