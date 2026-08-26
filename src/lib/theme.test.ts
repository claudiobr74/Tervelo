import { describe, expect, it } from "vitest";
import {
  DEFAULT_THEME_PREFERENCE,
  getServerThemeSnapshot,
  isThemePreference,
  resolveTheme,
} from "@/lib/theme";

describe("resolveTheme", () => {
  it("usa dark quando a preferência é dark", () => {
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("usa light quando a preferência é light", () => {
    expect(resolveTheme("light", true)).toBe("light");
  });

  it("segue o sistema quando a preferência é system", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });
});

describe("DEFAULT_THEME_PREFERENCE", () => {
  it("é dark, conforme Foundations", () => {
    expect(DEFAULT_THEME_PREFERENCE).toBe("dark");
    expect(getServerThemeSnapshot()).toEqual({ preference: "dark", resolved: "dark" });
    expect(getServerThemeSnapshot()).toBe(getServerThemeSnapshot());
  });
});

describe("isThemePreference", () => {
  it("aceita apenas light, dark e system", () => {
    expect(isThemePreference("dark")).toBe(true);
    expect(isThemePreference("auto")).toBe(false);
    expect(isThemePreference(null)).toBe(false);
  });
});
