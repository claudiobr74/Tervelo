"use client";

export function ChoiceGroup<T extends string | number | boolean>({
  legend,
  options,
  value,
  onChange,
  columns = 1,
}: {
  legend: string;
  options: readonly { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
  columns?: 1 | 2;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-bold text-foreground">{legend}</legend>
      <div className={`grid gap-2 ${columns === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={String(option.value)}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={`flex min-h-12 items-center justify-center rounded-[var(--radius-lg)] border px-3 text-sm font-semibold ${
                selected
                  ? "border-brand bg-brand-soft text-brand"
                  : "border-border bg-surface text-foreground"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
