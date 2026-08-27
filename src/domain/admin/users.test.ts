import { describe, expect, it } from "vitest";
import { adherenceTone, filterAdminUsers, formatThousands, type AdminUser } from "./users";

const users: AdminUser[] = [
  {
    id: "1",
    name: "Lucas Mendes",
    avatar: "/x.webp",
    status: "Ativo",
    plan: "Elite",
    goal: "Hipertrofia",
    lastWorkout: "Peitoral e Tríceps",
    adherencePct: 84,
    lastActivity: "Hoje, 09:41",
  },
  {
    id: "2",
    name: "Carla Oliveira",
    avatar: "/x.webp",
    status: "Inativo",
    plan: "Elite",
    goal: "Perda de Peso",
    lastWorkout: "Cardio HIIT",
    adherencePct: 48,
    lastActivity: "Há 5 dias",
  },
];

describe("admin users", () => {
  it("filtra por nome sem inventar linha", () => {
    expect(filterAdminUsers(users, { query: "carla", status: "Todos", plan: "Todos", goal: "Todos" }).map((u) => u.name)).toEqual([
      "Carla Oliveira",
    ]);
  });

  it("filtra status inativo", () => {
    expect(filterAdminUsers(users, { query: "", status: "Inativo", plan: "Todos", goal: "Todos" })).toHaveLength(1);
  });

  it("pinta aderência por faixa", () => {
    expect(adherenceTone(84)).toBe("success");
    expect(adherenceTone(68)).toBe("brand");
    expect(adherenceTone(48)).toBe("error");
  });

  it("formata milhares no pt-BR do Figma", () => {
    expect(formatThousands(1247)).toBe("1.247");
  });
});
