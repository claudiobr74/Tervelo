import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";

export type LegalSection = { heading: string; body: string };

export function LegalPage({
  title,
  updatedAt,
  sections,
}: {
  title: string;
  updatedAt: string;
  sections: LegalSection[];
}) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-4">
        <Link href="/" aria-label="TERVELO">
          <BrandLogo className="h-9 w-auto max-w-[180px]" />
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold text-foreground">{title}</h1>
          <p className="text-sm text-muted">Atualizado em {updatedAt}</p>
        </div>
      </header>
      <div className="flex flex-col gap-6">
        {sections.map((section) => (
          <section key={section.heading} className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-foreground">{section.heading}</h2>
            <p className="text-[15px] leading-7 text-muted">{section.body}</p>
          </section>
        ))}
      </div>
      <Link href="/" className="text-sm font-semibold text-brand">
        Voltar para a página inicial
      </Link>
    </main>
  );
}
