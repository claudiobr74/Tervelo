import { type InputHTMLAttributes, forwardRef } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = "", error, disabled, id, ...props },
  ref,
) {
  const errorId = error && id ? `${id}-error` : undefined;

  return (
    <div className="flex w-full flex-col gap-1.5">
      <input
        ref={ref}
        id={id}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={`h-12 w-full rounded-[var(--radius-md)] border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-tertiary outline-none transition-[border-color,box-shadow] duration-200 focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50 ${
          error ? "border-error" : "border-border"
        } ${className}`.trim()}
        {...props}
      />
      {error ? (
        <p id={errorId} className="text-xs text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
});
