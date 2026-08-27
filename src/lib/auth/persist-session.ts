export async function persistSession(session: unknown): Promise<void> {
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(session),
  });
  if (!response.ok) {
    throw new Error("Não foi possível gravar a sessão. Tente de novo.");
  }
}
