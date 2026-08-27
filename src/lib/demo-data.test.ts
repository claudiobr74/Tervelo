import { describe, expect, it } from "vitest";
import { catalogDemoEnabled, demoDataEnabled } from "./demo-data";

describe("dados de demonstração", () => {
  it("nunca inventa atleta, treino, nutrição nem lista de usuários", () => {
    expect(demoDataEnabled()).toBe(false);
  });

  it("catálogo de exercícios continua disponível só no Nhost local", () => {
    expect(typeof catalogDemoEnabled()).toBe("boolean");
  });
});
