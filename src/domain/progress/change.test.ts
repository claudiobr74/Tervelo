import { describe, expect, it } from "vitest";
import { percentChange } from "./change";

describe("variação percentual", () => {
  it("calcula a progressão de 8 semanas do Figma", () => {
    expect(percentChange(82, 82 / 1.12)?.toFixed(1)).toBe("12.0");
    expect(Math.round(percentChange(110, 110 / 1.08) ?? 0)).toBe(8);
  });

  it("recusa base zero", () => {
    expect(percentChange(82, 0)).toBeNull();
  });
});
