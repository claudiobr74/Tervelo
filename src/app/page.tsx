import { cookies } from "next/headers";
import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { NHOST_SESSION_COOKIE } from "@/lib/nhost/config";
import { parseSessionCookie } from "@/lib/auth/session";

export default async function HomePage() {
  const session = parseSessionCookie((await cookies()).get(NHOST_SESSION_COOKIE)?.value);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-6 px-6 py-16">
      <p className="text-xs font-medium uppercase tracking-wide text-brand">Phase 4 — Auth</p>
      <h1 className="text-[length:var(--font-display)] leading-10 font-bold">TERVELO</h1>
      <p className="text-sm leading-5 text-muted">
        Scaffold interno. Login, cadastro e onboarding usam os nodes do Figma. Esta página não é a
        landing de marketing nem o treino do dia.
      </p>
      {session ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-foreground">
            Sessão ativa{session.user?.displayName ? `: ${session.user.displayName}` : ""}.
            {session.preview ? " (pré-visualização local)" : ""}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/onboarding/perfil"
              className="inline-flex h-11 w-fit items-center justify-center rounded-[var(--radius-md)] bg-brand px-6 text-sm font-semibold text-on-brand"
            >
              Continuar onboarding
            </Link>
            <LogoutButton />
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          <Link
            href="/login"
            className="inline-flex h-11 w-fit items-center justify-center rounded-[var(--radius-md)] bg-brand px-6 text-sm font-semibold text-on-brand"
          >
            Entrar
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-11 w-fit items-center justify-center rounded-[var(--radius-md)] border border-brand px-6 text-sm font-semibold text-brand"
          >
            Criar conta
          </Link>
        </div>
      )}
      <Link href="/dev/tokens" className="text-sm font-semibold text-muted underline">
        Tokens de desenvolvimento
      </Link>
    </main>
  );
}
