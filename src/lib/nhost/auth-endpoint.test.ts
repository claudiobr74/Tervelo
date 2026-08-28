import { describe, expect, it } from "vitest";
import { nhostAuthBaseUrl } from "./auth-endpoint";

describe("endpoint Auth Nhost", () => {
  it("some local não inventa URL", () => {
    expect(nhostAuthBaseUrl()).toBeNull();
  });
});
