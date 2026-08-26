import { describe, expect, it } from "vitest";
import { searchCatalogExercises } from "./search";

const catalog = [
  {
    id: "ex-puxada-alta",
    namePt: "Puxada Alta Aberta",
    primaryMuscle: "Latíssimo do dorso",
    secondaryMuscles: ["Bíceps"],
    equipmentName: "Lat Pulldown",
    movementPattern: "Puxar vertical",
    aliases: ["lat pulldown", "puxada alta"],
    favorite: true,
  },
  {
    id: "ex-supino",
    namePt: "Supino Reto com Barra",
    primaryMuscle: "Peitoral maior",
    secondaryMuscles: ["Tríceps"],
    equipmentName: "Barra",
    movementPattern: "Empurrar horizontal",
    aliases: ["bench press"],
  },
];

describe("busca de exercícios", () => {
  it("encontra puxadas por prefixo e alias sem duplicar fabricante", () => {
    const hits = searchCatalogExercises(catalog, "pux");
    expect(hits.map((item) => item.id)).toEqual(["ex-puxada-alta"]);
  });

  it("filtra favoritos", () => {
    const hits = searchCatalogExercises(catalog, "", "favorites");
    expect(hits).toHaveLength(1);
    expect(hits[0].id).toBe("ex-puxada-alta");
  });

  it("filtra por equipamento", () => {
    const hits = searchCatalogExercises(catalog, "barra", "equipment");
    expect(hits.map((item) => item.id)).toEqual(["ex-supino"]);
  });
});
