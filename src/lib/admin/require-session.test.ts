import { describe, expect, it } from "vitest";
import { disconnectedOrFail, graphqlFailure } from "./require-session";

describe("respostas admin", () => {
  it("GET sem Nhost devolve lista vazia, sem fabricar linha", async () => {
    const response = disconnectedOrFail(
      { ok: false, reason: "nhost_unavailable" },
      { items: [] as string[] },
    );
    expect(response).not.toBeNull();
    expect(response?.status).toBe(200);
    await expect(response?.json()).resolves.toEqual({
      ok: true,
      data: { items: [] },
      disconnected: true,
    });
  });

  it("GET com GraphQL quebrado não finge sucesso", async () => {
    const response = disconnectedOrFail({ ok: false, reason: "graphql_error" }, { items: [] });
    expect(response?.status).toBe(502);
    await expect(response?.json()).resolves.toEqual({ ok: false, error: "graphql_error" });
  });

  it("mutação sem banco responde 503", async () => {
    const response = graphqlFailure("nhost_unavailable");
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ ok: false, error: "nhost_unavailable" });
  });
});
