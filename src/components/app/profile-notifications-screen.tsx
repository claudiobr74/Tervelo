"use client";

import { ProfileSubpageShell } from "@/components/app/profile-subpage-shell";
import { EmptyPanel } from "@/components/ui/empty-panel";
import { useAdminQuery } from "@/lib/admin/use-admin-query";

type Payload = {
  notifications: {
    id: string;
    type: string;
    payload: unknown;
    read_at: string | null;
    created_at: string;
  }[];
};

export function ProfileNotificationsScreen() {
  const { loading, data, error } = useAdminQuery<Payload>("/api/me/notifications");
  const items = data?.notifications ?? [];

  return (
    <ProfileSubpageShell title="Notificações">
      {loading ? <p className="text-sm text-muted">Consultando o banco…</p> : null}
      {error ? (
        <EmptyPanel title="Banco indisponível" body="Nenhuma notificação é inventada nesta tela." />
      ) : null}
      {!loading && !error && items.length === 0 ? (
        <EmptyPanel
          title="Caixa vazia"
          body="Avisos reais entram em public.notifications. Sem evento, a lista fica vazia."
        />
      ) : null}
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-[var(--radius-lg)] border border-border bg-surface p-4"
          >
            <p className="text-sm font-semibold">{item.type}</p>
            <p className="text-xs text-muted">
              {new Date(item.created_at).toLocaleString("pt-BR")}
            </p>
          </li>
        ))}
      </ul>
    </ProfileSubpageShell>
  );
}
