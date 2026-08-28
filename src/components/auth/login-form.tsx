"use client";

import Link from "next/link";
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
import { onboardingLandingPath } from "@/lib/auth/onboarding-sync";
import { isValidEmail, PASSWORD_MIN_LENGTH } from "@/lib/auth/password";

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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const body = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;
      if (!response.ok || !body?.ok) {
        setError(body?.error ?? "Não foi possível entrar.");
        return;
      }
      router.push(await onboardingLandingPath(searchParams.get("next")));
      router.refresh();
    } catch {
      setError("Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  }

  async function startOauth(provider: "google" | "apple") {
    setError(null);
    setInfo(null);
    const next = searchParams.get("next");
    const response = await fetch("/api/auth/oauth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        redirectTo: next && next.startsWith("/") ? next : "/app/today",
      }),
    });
    const body = (await response.json().catch(() => null)) as {
      ok?: boolean;
      error?: string;
      redirect?: string;
    } | null;
    if (body?.ok && body.redirect) {
      window.location.assign(body.redirect);
      return;
    }
    setError(body?.error ?? "Não foi possível iniciar o login social.");
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
            <Link href="/forgot-password" className="text-[13px] font-semibold text-brand">
              Esqueci minha senha
            </Link>
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
              onClick={() => void startOauth("google")}
              className="flex flex-1 items-center justify-center gap-2.5 rounded-[var(--radius-lg)] border border-border bg-surface p-3 text-sm font-semibold text-foreground"
            >
              <FigmaIcon src="/icons/google.svg" alt="" size={18} />
              Google
            </button>
            <button
              type="button"
              onClick={() => void startOauth("apple")}
              className="flex flex-1 items-center justify-center gap-2.5 rounded-[var(--radius-lg)] border border-border bg-surface p-3 text-sm font-semibold text-foreground"
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
