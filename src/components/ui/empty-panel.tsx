export function EmptyPanel({ title, body }: { title: string; body: string }) {
  return (
    <article className="flex flex-col gap-2 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
      <h2 className="text-base font-bold text-foreground">{title}</h2>
      <p className="text-sm text-muted">{body}</p>
    </article>
  );
}
