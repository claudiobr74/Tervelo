import { describe, expect, it } from "vitest";
import { sessionCanReachNhost } from "@/lib/nhost/graphql-server";

describe("sessionCanReachNhost", () => {
  it("recusa pré-visualização e token sentinela", () => {
    expect(sessionCanReachNhost(null)).toBe(false);
    expect(sessionCanReachNhost({ preview: true, accessToken: "abc" })).toBe(false);
    expect(sessionCanReachNhost({ accessToken: "preview" })).toBe(false);
  });

  it("aceita sessão real com access token", () => {
    expect(sessionCanReachNhost({ accessToken: "nhost-jwt" })).toBe(true);
  });
});
