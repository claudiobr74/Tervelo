import { afterEach, describe, expect, it, vi } from "vitest";
import { logError, logEvent, REDACTED, redactValue, sanitizeLogFields } from "@/lib/logger";

describe("redaction de logs", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("mascara e-mail, token, FC, nutrição e carga", () => {
    const sanitized = sanitizeLogFields({
      email: "lucas.atleta@gmail.com",
      accessToken: "secret-token",
      bpm: 148,
      heartRate: 150,
      energy_kcal: 2200,
      protein: 180,
      load_kg: 80,
      pendingCount: 3,
    });
    expect(sanitized.email).toBe(REDACTED);
    expect(sanitized.accessToken).toBe(REDACTED);
    expect(sanitized.bpm).toBe(REDACTED);
    expect(sanitized.heartRate).toBe(REDACTED);
    expect(sanitized.energy_kcal).toBe(REDACTED);
    expect(sanitized.protein).toBe(REDACTED);
    expect(sanitized.load_kg).toBe(REDACTED);
    expect(sanitized.pendingCount).toBe(3);
  });

  it("mascara JWT e e-mail em valores soltos", () => {
    expect(redactValue("lucas.atleta@gmail.com")).toBe(REDACTED);
    expect(redactValue("aaa.bbb.ccc")).toBe(REDACTED);
    expect(redactValue("offline_ready")).toBe("offline_ready");
  });

  it("não serializa PII no JSON emitido", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    logEvent("auth.session.set", { email: "lucas.atleta@gmail.com", refreshToken: "abc" });
    const line = spy.mock.calls[0]?.[0] as string;
    expect(line).not.toContain("lucas.atleta");
    expect(line).not.toContain("abc");
    expect(line).toContain(REDACTED);
    expect(line).toContain("auth.session.set");
  });

  it("redige mensagem de erro com e-mail", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    logError("ui.error_boundary", new Error("falhou para lucas.atleta@gmail.com"));
    const line = spy.mock.calls[0]?.[0] as string;
    expect(line).not.toContain("lucas.atleta");
    expect(line).toContain(REDACTED);
  });
});
