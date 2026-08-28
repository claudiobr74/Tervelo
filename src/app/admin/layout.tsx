import { redirect } from "next/navigation";
import { getServerAppSession } from "@/lib/auth/session";
import { sessionHasAdminAccess } from "@/lib/auth/session-cookie";

/**
 * Segunda barreira além do proxy. O papel é reconferido com o token verificado,
 * então um cookie forjado não renderiza o console administrativo.
 */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await getServerAppSession();
  if (!session) {
    redirect("/login?next=/admin");
  }
  if (!(await sessionHasAdminAccess(session))) {
    redirect("/");
  }
  return children;
}
