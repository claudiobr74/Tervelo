"use client";

import { useState, type FormEvent } from "react";
import {
  AuthFooterLink,
  AuthShell,
  FieldLabel,
  AUTH_INPUT_CLASS,
  PRIMARY_CTA_CLASS,
} from "@/components/auth/auth-shell";
import { BrandMark } from "@/components/auth/brand-mark";
import { isValidEmail } from "@/lib/auth/password";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    if (!isValidEmail(email)) {
      setError("Informe o e-mail para redefinir a senha.");
      return;
    }
    setLoading(true);
    try {
      await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
    } catch {
      // Resposta genérica — não revela se a conta existe.
    } finally {
      setLoading(false);
      setInfo("Se o e-mail existir, enviaremos as instruções para redefinir a senha.");
    }
  }

  return (
    <AuthShell footer={<AuthFooterLink prompt="Lembrou a senha?" href="/login" action="Entrar" />}>
      <BrandMark subtitle="Informe o e-mail da conta. O Auth envia o link se ela existir." />
      <form onSubmit={onSubmit} className="flex w-full flex-col gap-[18px] px-6" noValidate>
        <h1 className="text-xl font-extrabold text-foreground">Redefinir senha</h1>
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={AUTH_INPUT_CLASS}
          />
        </div>
        {error ? <p className="text-sm text-error">{error}</p> : null}
        {info ? <p className="text-sm text-muted">{info}</p> : null}
        <button type="submit" disabled={loading} className={PRIMARY_CTA_CLASS}>
          {loading ? "Enviando..." : "Enviar instruções"}
        </button>
      </form>
    </AuthShell>
  );
}
