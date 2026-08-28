import { describe, expect, it } from "vitest";
import { messageFromAuthBody } from "./nhost-error";

describe("erros do Auth Nhost", () => {
  it("não confirma se o e-mail já existe", () => {
    expect(messageFromAuthBody({ message: "email already exists" })).toMatch(
      /outro e-mail|entrar/i,
    );
  });

  it("traduz senha curta e login inválido", () => {
    expect(messageFromAuthBody({ error: "password is too short" })).toMatch(/mínimo/);
    expect(messageFromAuthBody({ message: "invalid email or password" })).toMatch(/não conferem/);
  });

  it("não devolve inglês cru", () => {
    expect(messageFromAuthBody({ message: "An unexpected error occurred" })).not.toMatch(
      /unexpected/i,
    );
  });
});
