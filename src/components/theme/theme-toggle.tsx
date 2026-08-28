"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";
import type { ThemePreference } from "@/lib/theme";

const OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Padrão do sistema", icon: Monitor },
];

export function ThemeToggle() {
  const { preference, setPreference } = useTheme();

  return (
    <div role="radiogroup" aria-label="Aparência do aplicativo" className="flex flex-col gap-2">
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const selected = preference === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setPreference(value)}
            className={`flex min-h-11 items-center gap-3 rounded-[var(--radius-md)] border px-4 py-3 text-left text-sm font-medium transition-[background-color,border-color] duration-200 ${
              selected
                ? "border-brand bg-surface-secondary text-foreground"
                : "border-border bg-surface text-muted hover:bg-surface-hover"
            }`}
          >
            <Icon className="size-5 shrink-0" strokeWidth={1.5} aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}
