"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProfileSubpageShell } from "@/components/app/profile-subpage-shell";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { adminRequest } from "@/lib/admin/http";
import { useAdminQuery } from "@/lib/admin/use-admin-query";

type Prefs = {
  displayName: string;
  locale: string;
  shortcutsEnabled: boolean;
  themePreference: string;
};

export function ProfilePrivacyScreen() {
  const { data, error, reload } = useAdminQuery<Prefs>("/api/me/preferences");
  const [shortcuts, setShortcuts] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (data) setShortcuts(data.shortcutsEnabled);
  }, [data]);

  async function saveShortcuts(next: boolean) {
    setShortcuts(next);
    setMessage(null);
    const result = await adminRequest("/api/me/preferences", {
      method: "PATCH",
      body: JSON.stringify({ shortcutsEnabled: next }),
    });
    if (!result.ok) {
      setShortcuts(!next);
      setMessage(
        result.error === "nhost_unavailable"
          ? "Sem banco para gravar a preferência."
          : "Não gravou a preferência.",
      );
      return;
    }
    await reload();
  }

  return (
    <ProfileSubpageShell title="Privacidade">
      <p className="text-sm text-muted">
        Treinos, medidas e check-ins pertencem à sua conta. Sem Nhost, nada sai deste aparelho.
      </p>
      {error ? <p className="text-sm text-error">Não leu as preferências no banco.</p> : null}
      <div className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-4">
        <div>
          <p className="text-sm font-semibold">Atalhos de teclado</p>
          <p className="text-xs text-muted">Gravado em profiles.shortcuts_enabled.</p>
        </div>
        <ToggleSwitch
          checked={shortcuts}
          onChange={(next) => void saveShortcuts(next)}
          label="Atalhos de teclado"
        />
      </div>
      {message ? <p className="text-sm text-error">{message}</p> : null}
      <Link href="/privacidade" className="text-sm font-semibold text-brand">
        Política de Privacidade
      </Link>
    </ProfileSubpageShell>
  );
}
