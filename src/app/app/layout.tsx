import { redirect } from "next/navigation";
import { getServerAppSession } from "@/lib/auth/session";

/**
 * Segunda barreira além do proxy: se a requisição chegar aqui sem sessão,
 * nenhuma tela do atleta é renderizada.
 */
export default async function AthleteLayout({ children }: LayoutProps<"/app">) {
  const session = await getServerAppSession();
  if (!session) {
    redirect("/login");
  }
  return children;
}
