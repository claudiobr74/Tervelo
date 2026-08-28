import { EmptyPanel } from "@/components/ui/empty-panel";
import { databaseCopy } from "@/lib/admin/use-admin-query";

export function AdminStatusPanel({
  loading,
  error,
  empty,
  emptyTitle,
  emptyBody,
}: {
  loading: boolean;
  error: string | null;
  empty: boolean;
  emptyTitle: string;
  emptyBody: string;
}) {
  if (loading) {
    return <EmptyPanel title="Carregando" body="Consultando o banco com a sua sessão." />;
  }
  if (error) {
    return <EmptyPanel title="Banco indisponível" body={databaseCopy(error)} />;
  }
  if (empty) {
    return <EmptyPanel title={emptyTitle} body={emptyBody} />;
  }
  return null;
}
