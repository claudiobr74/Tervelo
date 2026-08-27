import { describe, expect, it } from "vitest";
import {
  DEFAULT_THEME_PREFERENCE,
  getServerThemeSnapshot,
  isThemePreference,
  resolveTheme,
  THEME_BOOTSTRAP_SCRIPT,
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
  it("abre no claro, inclusive antes de haver sessão", () => {
    expect(DEFAULT_THEME_PREFERENCE).toBe("light");
    expect(getServerThemeSnapshot()).toEqual({ preference: "light", resolved: "light" });
    expect(getServerThemeSnapshot()).toBe(getServerThemeSnapshot());
  });

  it("não segue o sistema por padrão: quem quer escuro precisa escolher", () => {
    expect(resolveTheme(DEFAULT_THEME_PREFERENCE, true)).toBe("light");
  });
});

describe("THEME_BOOTSTRAP_SCRIPT", () => {
  it("cai no claro quando o armazenamento falha", () => {
    const fallback = THEME_BOOTSTRAP_SCRIPT.split("catch(e){")[1];
    expect(fallback).toContain('classList.remove("dark")');
    expect(fallback).toContain('dataset.theme="light"');
  });
});

describe("isThemePreference", () => {
  it("aceita apenas light, dark e system", () => {
    expect(isThemePreference("dark")).toBe(true);
    expect(isThemePreference("auto")).toBe(false);
    expect(isThemePreference(null)).toBe(false);
  });
});
