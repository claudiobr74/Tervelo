import { afterEach, describe, expect, it } from "vitest";
import { consumeRateLimit, resetRateLimitForTests } from "@/lib/security/rate-limit";

describe("rate limit", () => {
  afterEach(() => {
    resetRateLimitForTests();
  });

  it("permite até o máximo e depois bloqueia", () => {
    expect(consumeRateLimit("a", { max: 2, windowMs: 60_000, now: 1 })).toBe("ok");
    expect(consumeRateLimit("a", { max: 2, windowMs: 60_000, now: 2 })).toBe("ok");
    expect(consumeRateLimit("a", { max: 2, windowMs: 60_000, now: 3 })).toBe("limited");
  });

  it("reinicia depois da janela", () => {
    expect(consumeRateLimit("b", { max: 1, windowMs: 10, now: 0 })).toBe("ok");
    expect(consumeRateLimit("b", { max: 1, windowMs: 10, now: 11 })).toBe("ok");
  });
});
