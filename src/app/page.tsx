import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-6 px-6 py-16">
      <p className="text-xs font-medium uppercase tracking-wide text-brand">Phase 1 — Foundation</p>
      <h1 className="text-[length:var(--font-display)] leading-10 font-bold">TERVELO</h1>
      <p className="text-sm leading-5 text-muted">
        Scaffold interno. Telas de produto entram só com o node Figma correspondente — esta
        página não é a landing de marketing.
      </p>
      <Link
        href="/dev/tokens"
        className="inline-flex h-11 w-fit items-center justify-center rounded-[var(--radius-md)] bg-brand px-6 text-sm font-semibold text-on-brand transition-colors duration-200 hover:bg-brand-accent"
      >
        Abrir tokens de desenvolvimento
      </Link>
    </main>
  );
}
