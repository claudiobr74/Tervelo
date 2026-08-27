export async function persistSession(session: unknown): Promise<void> {
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(session),
  });
  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Muitas tentativas. Aguarde um instante e tente de novo.");
    }
    throw new Error("Não foi possível gravar a sessão. Tente de novo.");
  }
}
