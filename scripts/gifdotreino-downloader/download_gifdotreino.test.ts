import { describe, expect, it } from "vitest";
import {
  absoluteFromSite,
  categoryFromPath,
  isGifMagic,
  looksLikeGif,
  slugify,
} from "./download_gifdotreino.mjs";

describe("gifdotreino downloader helpers", () => {
  it("slugifica nomes com acento e pontuação", () => {
    expect(slugify("Puxada Alta Aberta")).toBe("puxada-alta-aberta");
    expect(slugify("Abdução Lateral do Quadril com Alavanca")).toBe(
      "abducao-lateral-do-quadril-com-alavanca",
    );
  });

  it("lê a categoria do caminho Exercicios/Pasta/arquivo.gif", () => {
    expect(
      categoryFromPath("Exercicios/Glúteos/Abdução Lateral do Quadril com Alavanca.gif"),
    ).toBe("Glúteos");
    expect(categoryFromPath("")).toBe("sem-categoria");
  });

  it("monta URL absoluta com segmentos percent-encoded", () => {
    const url = absoluteFromSite("Exercicios/Glúteos/Abdução.gif");
    expect(url).toContain("https://www.gifdotreino.com/");
    expect(url).toContain("Exercicios/");
    expect(url).toContain(encodeURIComponent("Glúteos"));
    expect(url).toContain(encodeURIComponent("Abdução.gif"));
  });

  it("reconhece GIF por extensão, content-type e magia", () => {
    expect(looksLikeGif("https://x/a.gif", "")).toBe(true);
    expect(looksLikeGif("https://x/a.png", "image/gif")).toBe(true);
    expect(looksLikeGif("https://x/a.png", "image/png")).toBe(false);
    expect(isGifMagic(Buffer.from("GIF89a...."))).toBe(true);
    expect(isGifMagic(Buffer.from("GIF87a"))).toBe(true);
    expect(isGifMagic(Buffer.from("RIFF"))).toBe(false);
  });
});
