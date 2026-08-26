import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getNhostPublicConfig } from "@/lib/nhost/config";

export const metadata = {
  title: "Tokens — TERVELO",
  robots: { index: false, follow: false },
};

const COLOR_TOKENS = [
  ["background", "bg-background"],
  ["surface", "bg-surface"],
  ["surface-secondary", "bg-surface-secondary"],
  ["brand", "bg-brand"],
  ["success", "bg-success"],
  ["warning", "bg-warning"],
  ["error", "bg-error"],
  ["info", "bg-info"],
] as const;

export default function TokensPage() {
  const nhost = getNhostPublicConfig();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-12">
      <header className="flex flex-col gap-2">
        <p className="text-[10px] font-medium tracking-wide text-tertiary uppercase">
          Desenvolvimento
        </p>
        <h1 className="text-[length:var(--font-h1)] leading-8 font-bold">Tokens TERVELO</h1>
        <p className="text-sm text-muted">
          Fonte: Handoff Figma <code className="text-foreground">28:527</code>. Não é uma tela de
          produto.
        </p>
        <Link href="/" className="text-sm font-medium text-brand hover:text-brand-accent">
          Voltar ao scaffold
        </Link>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-[length:var(--font-h2)] leading-7 font-semibold">Aparência</h2>
        <ThemeToggle />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[length:var(--font-h2)] leading-7 font-semibold">Cores</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {COLOR_TOKENS.map(([name, swatch]) => (
            <div key={name} className="flex flex-col gap-2">
              <div className={`h-16 rounded-[var(--radius-md)] border border-border ${swatch}`} />
              <span className="text-xs text-muted">{name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[length:var(--font-h2)] leading-7 font-semibold">Tipografia</h2>
        <p className="text-[length:var(--font-display)] leading-10 font-bold">Display 32</p>
        <p className="text-[length:var(--font-h1)] leading-8 font-bold">Heading 1</p>
        <p className="text-[length:var(--font-h2)] leading-7 font-semibold">Heading 2</p>
        <p className="text-sm leading-5">Body 14 — Repetições em reserva (RIR)</p>
        <p className="text-xs text-muted">Caption 12</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[length:var(--font-h2)] leading-7 font-semibold">Componentes</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Iniciar treino</Button>
          <Button variant="secondary">Cancelar</Button>
          <Button variant="ghost">Fantasma</Button>
          <Button variant="danger">Excluir</Button>
          <Button loading>Carregando</Button>
          <Button disabled>Desabilitado</Button>
        </div>
        <div className="max-w-sm">
          <Input id="demo-carga" placeholder="Carga (kg)" />
        </div>
        <div className="max-w-sm">
          <Input id="demo-erro" placeholder="E-mail" error="Informe um e-mail válido." />
        </div>
        <Card className="max-w-sm">
          <div className="flex items-center gap-2">
            <CardTitle>Treino de hoje</CardTitle>
            <Badge>Pendente</Badge>
          </div>
          <CardBody>Superfície para conteúdo de treino, recuperação e nutrição.</CardBody>
        </Card>
      </section>

      <section className="flex flex-col gap-2 text-xs text-tertiary">
        <p>
          Nhost subdomain: <code className="text-muted">{nhost.subdomain}</code> / region:{" "}
          <code className="text-muted">{nhost.region}</code>
        </p>
        <p>Valores `local` significam stub — preencher `.env.local` (D-009).</p>
      </section>
    </main>
  );
}
