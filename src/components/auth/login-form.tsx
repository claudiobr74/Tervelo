"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  AuthFooterLink,
  AuthShell,
  FieldLabel,
  AUTH_INPUT_CLASS,
  PRIMARY_CTA_CLASS,
} from "@/components/auth/auth-shell";
import { BrandMark } from "@/components/auth/brand-mark";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { isLocalNhost, previewSession } from "@/lib/auth/local-preview";
import { onboardingLandingPath } from "@/lib/auth/onboarding-sync";
import { persistSession } from "@/lib/auth/persist-session";
import { isValidEmail, PASSWORD_MIN_LENGTH } from "@/lib/auth/password";
import { getBrowserNhostClient } from "@/lib/nhost/browser";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    if (!isValidEmail(email)) {
      setError("Informe um e-mail válido.");
      return;
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
      setError(`A senha precisa ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`);
      return;
    }
    setLoading(true);
    try {
      if (isLocalNhost()) {
        await persistSession(previewSession({ email: email.trim() }));
        router.push(await onboardingLandingPath(searchParams.get("next")));
        router.refresh();
        return;
      }
      const nhost = getBrowserNhostClient();
      const response = await nhost.auth.signInEmailPassword({ email: email.trim(), password });
      const session = response.body.session;
      if (!session) {
        setError("Não foi possível entrar. Confirme o e-mail se ainda não verificou a conta.");
        return;
      }
      await persistSession(session);
      router.push(await onboardingLandingPath(searchParams.get("next")));
      router.refresh();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Não foi possível entrar.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function onForgotPassword() {
    setError(null);
    setInfo(null);
    if (!isValidEmail(email)) {
      setError("Informe o e-mail para redefinir a senha.");
      return;
    }
    if (isLocalNhost()) {
      setInfo("Se o e-mail existir, enviaremos as instruções para redefinir a senha.");
      return;
    }
    try {
      const nhost = getBrowserNhostClient();
      await nhost.auth.sendPasswordResetEmail({ email: email.trim() });
    } catch {
      // Resposta genérica mesmo em falha — não revela se a conta existe.
    }
    setInfo("Se o e-mail existir, enviaremos as instruções para redefinir a senha.");
  }

  return (
    <AuthShell
      footer={<AuthFooterLink prompt="Não tem uma conta?" href="/signup" action="Criar conta" />}
    >
      <BrandMark subtitle="Sua jornada para alta performance começa aqui." />
      <form onSubmit={onSubmit} className="flex w-full flex-col gap-[18px] px-6" noValidate>
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="lucas.atleta@gmail.com"
            className={AUTH_INPUT_CLASS}
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="password">Senha</FieldLabel>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={AUTH_INPUT_CLASS}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-[13px] font-semibold text-brand"
            >
              Esqueci minha senha
            </button>
          </div>
        </div>
        {error ? <p className="text-sm text-error">{error}</p> : null}
        {info ? <p className="text-sm text-muted">{info}</p> : null}
        <div className="flex flex-col gap-4 pt-8">
          <button type="submit" disabled={loading} className={PRIMARY_CTA_CLASS}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[12px] font-semibold uppercase text-tertiary">
              ou continue com
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              disabled
              title="Login social entra quando o provedor Nhost estiver ligado (D-017)."
              className="flex flex-1 items-center justify-center gap-2.5 rounded-[var(--radius-lg)] border border-border bg-surface p-3 text-sm font-semibold text-foreground opacity-60"
            >
              <FigmaIcon src="/icons/google.svg" alt="" size={18} />
              Google
            </button>
            <button
              type="button"
              disabled
              title="Login social entra quando o provedor Nhost estiver ligado (D-017)."
              className="flex flex-1 items-center justify-center gap-2.5 rounded-[var(--radius-lg)] border border-border bg-surface p-3 text-sm font-semibold text-foreground opacity-60"
            >
              <FigmaIcon src="/icons/apple.svg" alt="" size={18} />
              Apple
            </button>
          </div>
        </div>
      </form>
    </AuthShell>
  );
}
