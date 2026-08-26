"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="inline-flex h-11 w-fit items-center justify-center rounded-[var(--radius-md)] border border-border px-6 text-sm font-semibold text-foreground"
    >
      Sair
    </button>
  );
}
