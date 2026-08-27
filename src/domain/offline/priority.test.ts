import { describe, expect, it } from "vitest";
import { priorityFor, SYNC_PRIORITY } from "./priority";

describe("priorityFor", () => {
  it("envia o treino antes da nutrição", () => {
    expect(priorityFor("training_session")).toBeLessThan(priorityFor("nutrition_checkin"));
    expect(priorityFor("set_result")).toBeLessThan(priorityFor("body_measurement"));
    expect(priorityFor("body_measurement")).toBeLessThan(priorityFor("nutrition_hydration"));
  });

  it("fecha a sessão depois das séries que pertencem a ela", () => {
    expect(priorityFor("training_session", "SESSION_COMPLETED")).toBeGreaterThan(priorityFor("set_result"));
    expect(priorityFor("training_session", "complete_session")).toBe(SYNC_PRIORITY.session_complete);
  });

  it("deixa upload de arquivo por último", () => {
    const others = (
      ["training_session", "set_result", "body_measurement", "nutrition_checkin"] as const
    ).map((entity) => priorityFor(entity));
    expect(Math.max(...others)).toBeLessThan(priorityFor("file_upload"));
  });

  it("ordena uma fila mista do mais urgente ao menos urgente", () => {
    const queue = ["nutrition_meal", "set_result", "file_upload", "training_session"] as const;
    const ordered = [...queue].sort((a, b) => priorityFor(a) - priorityFor(b));
    expect(ordered).toEqual(["training_session", "set_result", "nutrition_meal", "file_upload"]);
  });
});
