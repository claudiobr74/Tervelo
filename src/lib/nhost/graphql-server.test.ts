import { describe, expect, it } from "vitest";
import { sessionCanReachNhost, storageAuthHeaders } from "@/lib/nhost/graphql-server";

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

describe("storageAuthHeaders", () => {
  it("usa Bearer na sessão real e ignora preview", () => {
    expect(storageAuthHeaders({ preview: true, accessToken: "abc" })).toEqual([]);
    expect(storageAuthHeaders({ accessToken: "nhost-jwt" })).toEqual([
      { Authorization: "Bearer nhost-jwt" },
    ]);
  });
});
