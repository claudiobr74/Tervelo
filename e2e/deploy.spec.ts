import { expect, test } from "@playwright/test";

test.describe("deploy smoke", () => {
  test("health expõe status e alvo de deploy sem secrets", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBe(true);
    const body = await response.json();
    expect(body.status).toBe("ok");
    expect(body.service).toBe("tervelo-web");
    expect(body.version).toBeTruthy();
    expect(["local", "preview", "production"]).toContain(body.deploy);
    expect(["local-preview", "configured"]).toContain(body.nhost);
    expect(JSON.stringify(body)).not.toMatch(/secret|token|password/i);
  });

  test("login é público e traz headers de segurança", async ({ page }) => {
    const response = await page.goto("/login");
    expect(response?.ok()).toBe(true);
    const headers = response?.headers() ?? {};
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
  });
});
