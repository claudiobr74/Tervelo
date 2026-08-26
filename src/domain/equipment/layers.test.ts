import { describe, expect, it } from "vitest";
import { isCatalogWriteRole } from "./layers";

describe("camadas de equipamento", () => {
  it("atleta não escreve catálogo; admin sim", () => {
    expect(isCatalogWriteRole("user")).toBe(false);
    expect(isCatalogWriteRole("admin")).toBe(true);
    expect(isCatalogWriteRole("super_admin")).toBe(true);
  });
});
