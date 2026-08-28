import { describe, expect, it } from "vitest";
import {
  loadAuthorizedExercises,
  presentCatalogExercises,
  resolveAuthorizedGifFile,
} from "./authorized-library";

describe("biblioteca autorizada em disco", () => {
  it("lê os 963 nomes extraídos e resolve um GIF existente", () => {
    const library = loadAuthorizedExercises();
    expect(library.length).toBe(963);
    const first = library[0];
    expect(first.name).toBe("Abdução Lateral do Quadril com Alavanca");
    expect(first.description_text.length).toBeGreaterThan(200);
    expect(first.gif_file).toMatch(/\.gif$/);
    const presented = presentCatalogExercises([]);
    expect(presented).toHaveLength(963);
    expect(presented[0].imageSrc).toBe(`/api/catalog/gif/${first.slug}`);
    const gif = resolveAuthorizedGifFile(first.slug);
    if (gif) {
      expect(gif.endsWith(".gif")).toBe(true);
    }
    expect(resolveAuthorizedGifFile("../secret")).toBeNull();
    expect(resolveAuthorizedGifFile("nao-existe-este-slug")).toBeNull();
  });
});
