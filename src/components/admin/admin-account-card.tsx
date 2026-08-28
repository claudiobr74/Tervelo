"use client";

import { InitialsAvatar } from "@/components/ui/initials-avatar";
import { useAdminQuery } from "@/lib/admin/use-admin-query";

type Me = {
  displayName: string;
  email: string | null;
  superAdmin: boolean;
  connected: boolean;
};

export function AdminAccountCard() {
  const { data } = useAdminQuery<Me>("/api/admin/me");
  const name = data?.displayName || "Administrador";
  return (
    <div className="flex items-center gap-3">
      <InitialsAvatar name={name} size={36} />
      <div className="min-w-0 flex flex-col">
        <p className="truncate text-sm font-semibold">{name}</p>
        <p className="truncate text-xs text-muted">
          {data?.superAdmin ? "Super admin" : "Administrador"}
          {data?.connected ? "" : " · sem banco"}
        </p>
      </div>
    </div>
  );
}
