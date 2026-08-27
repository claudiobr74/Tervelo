/**
 * Orquestração de IA — Phase 9. Phase 2 só reserva o endpoint autenticado.
 */
type FunctionRequest = {
  headers: Record<string, string | string[] | undefined>;
};

type FunctionResponse = {
  status: (code: number) => { json: (body: unknown) => void };
};

export default function orchestrate(request: FunctionRequest, response: FunctionResponse) {
  const raw = request.headers.authorization ?? request.headers.Authorization;
  const authorization = Array.isArray(raw) ? raw[0] : raw;
  if (!authorization?.startsWith("Bearer ")) {
    response.status(401).json({ error: "unauthorized" });
    return;
  }

  response.status(501).json({
    error: "not_implemented",
    phase: 9,
    message: "Orquestração real depois da UI do coach. Sem modelo nesta pré-visualização.",
  });
}
