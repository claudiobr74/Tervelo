import { describe, expect, it } from "vitest";
import { catalogDemoEnabled, demoDataEnabled } from "./demo-data";
import { PREVIEW_WORKOUT } from "./training/preview-workout";

describe("dados de demonstração", () => {
  it("nunca inventa atleta, treino, nutrição nem lista de usuários", () => {
    expect(demoDataEnabled()).toBe(false);
    expect(PREVIEW_WORKOUT.exercises).toEqual([]);
    expect(PREVIEW_WORKOUT.title).toBe("");
  });

  it("não religa catálogo de demonstração Figma", () => {
    expect(catalogDemoEnabled()).toBe(false);
  });
});
