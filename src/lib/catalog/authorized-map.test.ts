import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  confinedGifPath,
  gifMediaPath,
  isSafeGifSlug,
  mergeAuthorizedCatalog,
  overlayAuthorizedRow,
  patternLabel,
  toCatalogExercise,
  type AuthorizedExercise,
} from "./authorized-map";

const sample: AuthorizedExercise = {
  name: "Abdução Lateral do Quadril com Alavanca",
  slug: "abducao-lateral-do-quadril-com-alavanca",
  category: "Glúteos",
  pattern_slug: "hinge",
  gif_file: "gifs/gluteos/abducao-lateral-do-quadril-com-alavanca.gif",
  description_text: "Fortalece o glúteo médio.",
  description_status: "ok",
};

describe("slug e caminho do GIF", () => {
  it("aceita slug de exercício e recusa travessia", () => {
    expect(isSafeGifSlug("abducao-lateral-do-quadril-com-alavanca")).toBe(true);
    expect(isSafeGifSlug("../etc/passwd")).toBe(false);
    expect(isSafeGifSlug("foo/bar")).toBe(false);
    expect(isSafeGifSlug("")).toBe(false);
    expect(gifMediaPath("abducao-lateral")).toBe("/api/catalog/gif/abducao-lateral");
  });

  it("confina o arquivo dentro da pasta de saída", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "gdt-gifs-"));
    try {
      expect(confinedGifPath(root, "gifs/gluteos/ok.gif")).toBe(path.join(root, "gifs/gluteos/ok.gif"));
      expect(confinedGifPath(root, "../secret.gif")).toBeNull();
      expect(confinedGifPath(root, "/etc/passwd.gif")).toBeNull();
      expect(confinedGifPath(root, "gifs/../../etc/passwd.gif")).toBeNull();
      expect(confinedGifPath(root, "gifs/ok.png")).toBeNull();
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("mapa da biblioteca autorizada", () => {
  it("monta título, categoria, descrição e URL do GIF", () => {
    const exercise = toCatalogExercise(sample);
    expect(exercise.namePt).toBe(sample.name);
    expect(exercise.primaryMuscle).toBe("Glúteos");
    expect(exercise.description).toBe("Fortalece o glúteo médio.");
    expect(exercise.movementPattern).toBe("Dobrar o quadril");
    expect(exercise.imageSrc).toBe(
      "/api/catalog/gif/abducao-lateral-do-quadril-com-alavanca",
    );
    expect(patternLabel("horizontal_push")).toBe("Empurrar horizontal");
  });

  it("sobrepõe mídia no canônico do banco sem perder o id", () => {
    const merged = overlayAuthorizedRow(
      {
        id: "uuid-1",
        namePt: sample.name,
        description: "",
        primaryMuscle: "",
        secondaryMuscles: [],
        equipmentName: "",
        movementPattern: "",
        aliases: ["lat"],
      },
      sample,
    );
    expect(merged.id).toBe("uuid-1");
    expect(merged.imageSrc).toContain(sample.slug);
    expect(merged.primaryMuscle).toBe("Glúteos");
    expect(merged.description).toBe("Fortalece o glúteo médio.");
  });

  it("completa o catálogo com nomes que só existem na biblioteca", () => {
    const list = mergeAuthorizedCatalog(
      [
        {
          id: "uuid-figma",
          namePt: "Puxada Alta Aberta",
          description: "Do seed mínimo",
          primaryMuscle: "Latíssimo do dorso",
          secondaryMuscles: [],
          equipmentName: "Lat Pulldown",
          movementPattern: "Puxar vertical",
          aliases: ["lat pulldown"],
        },
      ],
      [sample],
    );
    expect(list).toHaveLength(2);
    expect(list[0].id).toBe("uuid-figma");
    expect(list[1].namePt).toBe(sample.name);
    expect(list[1].imageSrc).toBeDefined();
  });
});
