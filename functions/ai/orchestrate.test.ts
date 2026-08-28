import { describe, expect, it } from "vitest";
import orchestrate from "./orchestrate";

function capture() {
  let status = 0;
  let body: unknown;
  const response = {
    status(code: number) {
      status = code;
      return {
        json(payload: unknown) {
          body = payload;
        },
      };
    },
  };
  return {
    response,
    result: () => ({ status, body }),
  };
}

describe("functions/ai/orchestrate", () => {
  it("recusa sem Bearer", () => {
    const { response, result } = capture();
    orchestrate({ headers: {} }, response);
    expect(result()).toEqual({ status: 401, body: { error: "unauthorized" } });
  });

  it("autenticado recusa fabricar atleta", () => {
    const { response, result } = capture();
    orchestrate({ headers: { authorization: "Bearer token" } }, response);
    expect(result().status).toBe(200);
    expect(result().body).toMatchObject({
      ok: true,
      orchestrated: false,
      athleteFacts: "missing",
    });
  });
});
