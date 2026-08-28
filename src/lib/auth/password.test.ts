import { describe, expect, it } from "vitest";
import { isValidDisplayName, isValidEmail } from "./password";

describe("validação de cadastro", () => {
  it("aceita nome em português", () => {
    expect(isValidDisplayName("João da Silva")).toBe(true);
    expect(isValidDisplayName("A")).toBe(false);
    expect(isValidDisplayName("")).toBe(false);
  });

  it("aceita e-mail simples", () => {
    expect(isValidEmail("ana@tervelo.app")).toBe(true);
    expect(isValidEmail("ana")).toBe(false);
  });
});
