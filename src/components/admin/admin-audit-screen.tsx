"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { EmptyPanel } from "@/components/ui/empty-panel";

export function AdminAuditScreen() {
  return (
    <AdminShell active="Auditoria" title="Auditoria e Decisões da IA">
      <div className="flex flex-col gap-6">
        <EmptyPanel
          title="Nenhuma decisão registrada"
          body="A auditoria só lista decisões da IA sobre atletas reais. Registros de Lucas, Amanda ou qualquer pessoa de exemplo foram removidos."
        />
      </div>
    </AdminShell>
  );
}
