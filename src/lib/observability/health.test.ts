import { describe, expect, it } from "vitest";
import { healthPayload } from "@/lib/observability/health";

describe("health", () => {
  it("expõe status, serviço e versão sem secrets", () => {
    const payload = healthPayload();
    expect(payload.status).toBe("ok");
    expect(payload.service).toBe("tervelo-web");
    expect(payload.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(["local", "preview", "production"]).toContain(payload.deploy);
    expect(["local-preview", "configured"]).toContain(payload.nhost);
    expect(JSON.stringify(payload)).not.toMatch(/secret|token|password/i);
  });
});
