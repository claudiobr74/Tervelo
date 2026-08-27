import { describe, expect, it } from "vitest";
import {
  athleteDisplayName,
  firstName,
  greeting,
  initialsFromName,
} from "@/domain/athlete/display-name";

describe("firstName", () => {
  it("usa o primeiro nome de um nome completo", () => {
    expect(firstName("Lucas Mendes")).toBe("Lucas");
  });

  it("entende identificador vindo do e-mail", () => {
    expect(firstName("lucas.atleta")).toBe("Lucas");
    expect(firstName("ana-paula")).toBe("Ana");
  });

  it("não inventa nome quando não há informação", () => {
    expect(firstName("")).toBe("");
    expect(firstName(null)).toBe("");
    expect(firstName("   ")).toBe("");
  });
});

describe("greeting", () => {
  it("cumprimenta com nome quando existe", () => {
    expect(greeting("Lucas Mendes")).toBe("Olá, Lucas.");
  });

  it("cumprimenta sem nome quando não existe", () => {
    expect(greeting(undefined)).toBe("Olá.");
  });
});

describe("athleteDisplayName", () => {
  it("não cai em nome de demonstração", () => {
    expect(athleteDisplayName("", "Maria")).toBe("Maria");
    expect(athleteDisplayName("  ", null)).toBe("");
    expect(athleteDisplayName("Ana", "Outro")).toBe("Ana");
  });
});

describe("initialsFromName", () => {
  it("usa até duas letras do nome", () => {
    expect(initialsFromName("Ana Paula")).toBe("AP");
    expect(initialsFromName("lucas.atleta")).toBe("LA");
    expect(initialsFromName("")).toBe("A");
  });
});
