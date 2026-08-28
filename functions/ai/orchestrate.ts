/**
 * Orquestração autenticada. Sem fatos do atleta no pedido, não inventa treino.
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

  response.status(200).json({
    ok: true,
    orchestrated: false,
    athleteFacts: "missing",
    missingFields: ["atleta"],
    message:
      "Contrato recebido. Sem fatos de um atleta no pedido, a orquestração não inventa treino, carga nem nutrição.",
  });
}
