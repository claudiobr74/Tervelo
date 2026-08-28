"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function AdminEntryLink() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/auth/onboarding")
      .then(async (response) => {
        if (!response.ok) return;
        const body = (await response.json()) as { admin?: boolean };
        if (!cancelled && body.admin) setVisible(true);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  if (!visible) return null;

  return (
    <Link
      href="/admin"
      className="flex h-11 w-full items-center justify-center rounded-[var(--radius-md)] bg-brand text-sm font-bold text-on-brand"
    >
      Painel administrativo
    </Link>
  );
}
