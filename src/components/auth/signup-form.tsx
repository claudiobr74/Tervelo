"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AuthFooterLink, AuthShell, FieldLabel, AUTH_INPUT_CLASS, PRIMARY_CTA_CLASS } from "@/components/auth/auth-shell";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { isLocalNhost, previewSession } from "@/lib/auth/local-preview";
import { patchOnboarding } from "@/lib/auth/onboarding-store";
import { persistSession } from "@/lib/auth/persist-session";
import { isValidEmail, PASSWORD_MIN_LENGTH } from "@/lib/auth/password";
import { getBrowserNhostClient } from "@/lib/nhost/browser";

export function SignupForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [accepted, setAccepted] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    if (!displayName.trim()) {
      setError("Informe o nome completo.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Informe um e-mail válido.");
      return;
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
      setError(`A senha precisa ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`);
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    if (!accepted) {
      setError("Aceite os Termos de Serviço e a Política de Privacidade.");
      return;
    }
    setLoading(true);
    const name = displayName.trim().slice(0, 32);
    try {
      if (isLocalNhost()) {
        await persistSession(previewSession({ displayName: name, email: email.trim() }));
        patchOnboarding({ displayName: name });
        router.push("/onboarding/perfil");
        router.refresh();
        return;
      }
      const nhost = getBrowserNhostClient();
      const response = await nhost.auth.signUpEmailPassword({
        email: email.trim(),
        password,
        options: { displayName: name, locale: "pt" },
      });
      const session = response.body.session;
      if (!session) {
        setInfo("Conta criada. Confirme o e-mail para entrar.");
        return;
      }
      await persistSession(session);
      patchOnboarding({ displayName: name });
      router.push("/onboarding/perfil");
      router.refresh();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Não foi possível criar a conta.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell footer={<AuthFooterLink prompt="Já tem uma conta?" href="/login" action="Fazer login" />}>
      <header className="flex flex-col gap-3 px-6 pb-5 pt-4">
        <div className="flex items-center justify-between">
          <Link href="/login" aria-label="Voltar" className="size-6 text-foreground">
            <FigmaIcon src="/icons/arrow-left.svg" alt="" size={24} />
          </Link>
          <span className="size-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-foreground">Crie sua conta</h1>
      </header>
      <form onSubmit={onSubmit} className="flex w-full flex-col gap-4 px-6" noValidate>
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="name">Nome completo</FieldLabel>
          <input
            id="name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Ex: Lucas Silva"
            autoComplete="name"
            className={AUTH_INPUT_CLASS}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="seu@email.com"
            autoComplete="email"
            className={AUTH_INPUT_CLASS}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="password">Senha</FieldLabel>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={`Mínimo ${PASSWORD_MIN_LENGTH} caracteres`}
            autoComplete="new-password"
            className={AUTH_INPUT_CLASS}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="confirm">Confirmar senha</FieldLabel>
          <input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            placeholder="Repita a senha"
            autoComplete="new-password"
            className={AUTH_INPUT_CLASS}
          />
        </div>
        <label className="flex items-start gap-3 pt-2">
          <button
            type="button"
            role="checkbox"
            aria-checked={accepted}
            onClick={() => setAccepted((value) => !value)}
            className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-[var(--radius-sm)] ${
              accepted ? "bg-brand text-on-brand" : "border border-border bg-surface"
            }`}
          >
            {accepted ? <FigmaIcon src="/icons/check.svg" alt="" size={12} /> : null}
          </button>
          <span className="text-[13px] leading-[18px] text-muted">
            Ao continuar, você concorda com os Termos de Serviço e a Política de
            Privacidade.
          </span>
        </label>
        {error ? <p className="text-sm text-error">{error}</p> : null}
        {info ? <p className="text-sm text-muted">{info}</p> : null}
        <div className="pt-8">
          <button type="submit" disabled={loading} className={PRIMARY_CTA_CLASS}>
            {loading ? "Criando..." : "Criar minha conta"}
          </button>
        </div>
      </form>
    </AuthShell>
  );
}
