import { describe, expect, it } from "vitest";
import { allowPreviewSessions, nhostMode, resolveDeployTarget } from "@/lib/deploy/runtime";

describe("deploy runtime", () => {
  it("classifica local, preview e production", () => {
    expect(resolveDeployTarget({ NODE_ENV: "development" })).toBe("local");
    expect(resolveDeployTarget({ VERCEL_ENV: "preview", NODE_ENV: "production" })).toBe("preview");
    expect(resolveDeployTarget({ VERCEL_ENV: "production", NODE_ENV: "production" })).toBe(
      "production",
    );
    expect(resolveDeployTarget({ NODE_ENV: "production" })).toBe("production");
  });

  it("nunca permite sessão preview em production", () => {
    expect(
      allowPreviewSessions({
        VERCEL_ENV: "production",
        NODE_ENV: "production",
        NEXT_PUBLIC_NHOST_SUBDOMAIN: "local",
      }),
    ).toBe(false);
    expect(allowPreviewSessions({ NODE_ENV: "production" })).toBe(false);
  });

  it("no Preview Vercel só permite preview se Nhost for local", () => {
    expect(
      allowPreviewSessions({
        VERCEL_ENV: "preview",
        NODE_ENV: "production",
        NEXT_PUBLIC_NHOST_SUBDOMAIN: "local",
      }),
    ).toBe(true);
    expect(
      allowPreviewSessions({
        VERCEL_ENV: "preview",
        NODE_ENV: "production",
        NEXT_PUBLIC_NHOST_SUBDOMAIN: "wqttndghxeybdppcfnol",
      }),
    ).toBe(false);
  });

  it("dev local permite preview", () => {
    expect(allowPreviewSessions({ NODE_ENV: "development" })).toBe(true);
  });

  it("expõe modo Nhost sem secrets", () => {
    expect(nhostMode({ NEXT_PUBLIC_NHOST_SUBDOMAIN: "local" })).toBe("local-preview");
    expect(nhostMode({ NEXT_PUBLIC_NHOST_SUBDOMAIN: "abc" })).toBe("configured");
  });
});
