import { describe, expect, it } from "vitest";
import { getNhostPublicConfig } from "@/lib/nhost/config";

describe("getNhostPublicConfig", () => {
  it("usa local quando o env público está vazio", () => {
    expect(getNhostPublicConfig()).toEqual({
      subdomain: process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN || "local",
      region: process.env.NEXT_PUBLIC_NHOST_REGION || "local",
    });
  });
});
