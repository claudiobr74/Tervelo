import { expect, test } from "@playwright/test";

async function loginPreview(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("lucas.atleta@gmail.com");
  await page.getByLabel("Senha").fill("senha12345");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/onboarding\/perfil/);
}

test.describe("hardening", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("sem sessão /app vai para login", async ({ page }) => {
    await page.goto("/app/today");
    await expect(page).toHaveURL(/\/login/);
  });

  test("health responde ok com versão", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBe(true);
    const body = await response.json();
    expect(body.status).toBe("ok");
    expect(body.service).toBe("tervelo-web");
    expect(body.version).toBeTruthy();
  });

  test("resposta inclui headers de segurança", async ({ page }) => {
    const response = await page.goto("/login");
    const headers = response?.headers() ?? {};
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  });

  test("hoje tem skip link, heading e nav acessível", async ({ page }) => {
    await loginPreview(page);
    await page.goto("/app/today");
    await expect(page.getByRole("link", { name: "Ir para o conteúdo" })).toHaveCount(1);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Ir para o conteúdo" })).toBeFocused();
    await expect(page.getByRole("heading", { name: "Olá, Lucas." })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Navegação principal" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Hoje" })).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("button", { name: "Iniciar treino" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Configurações" })).toBeVisible();
  });

  test("configurações têm heading e botão com nome", async ({ page }) => {
    await loginPreview(page);
    await page.goto("/app/settings");
    await expect(page.getByRole("heading", { name: "Treino e dispositivos" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Dados e sincronização" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sincronizar agora" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Voltar" })).toBeVisible();
  });

  test("captura Light/Dark 390", async ({ page }) => {
    const stamp = Date.now();
    await loginPreview(page);
    await page.goto("/app/today");
    await page.screenshot({ path: `/tmp/cursor-artifacts/hardening_today_dark_390_${stamp}.png`, fullPage: true });
    await page.goto("/app/settings");
    await page.screenshot({ path: `/tmp/cursor-artifacts/hardening_settings_dark_390_${stamp}.png`, fullPage: true });
    await page.evaluate(() => window.localStorage.setItem("tervelo-theme", "light"));
    await page.goto("/app/today");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.screenshot({ path: `/tmp/cursor-artifacts/hardening_today_light_390_${stamp}.png`, fullPage: true });
    await page.goto("/app/settings");
    await page.screenshot({ path: `/tmp/cursor-artifacts/hardening_settings_light_390_${stamp}.png`, fullPage: true });
  });
});
