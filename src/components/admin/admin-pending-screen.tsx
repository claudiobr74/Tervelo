import { AdminShell, type AdminActive } from "@/components/admin/admin-shell";
import { EmptyPanel } from "@/components/ui/empty-panel";

export const ADMIN_PENDING_COPY = {
  Treinamento: {
    title: "Treinamento em implementação",
    body: "O menu abre esta página de propósito: o clique não deve travar o painel. Programas, turmas e o acionamento de treino entram aqui quando o layout for publicado.",
  },
  Nutrição: {
    title: "Nutrição em implementação",
    body: "O item do menu responde ao clique. Planos alimentares da academia e o contrato nutricional da unidade entram aqui quando o layout for publicado.",
  },
  Configurações: {
    title: "Configurações em implementação",
    body: "O item do menu responde ao clique. Preferências da unidade, papéis e integrações entram aqui quando o layout for publicado.",
  },
} as const satisfies Record<
  Extract<AdminActive, "Treinamento" | "Nutrição" | "Configurações">,
  { title: string; body: string }
>;

export function AdminPendingScreen({ active }: { active: keyof typeof ADMIN_PENDING_COPY }) {
  const copy = ADMIN_PENDING_COPY[active];
  return (
    <AdminShell active={active} title={active}>
      <EmptyPanel title={copy.title} body={copy.body} />
    </AdminShell>
  );
}
