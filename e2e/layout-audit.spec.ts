import { expect, test } from "@playwright/test";

async function loginPreview(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("lucas.atleta@gmail.com");
  await page.getByLabel("Senha").fill("senha12345");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/onboarding\/perfil/);
}

async function pageOverflow(page: import("@playwright/test").Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

test.describe("layout do app", () => {
  test("telas do atleta não extravasam em 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginPreview(page);

    for (const path of ["/app/today", "/app/progress", "/app/nutrition", "/app/workout", "/app/plates", "/app/coach", "/app/profile", "/app/profile/pessoais", "/app/settings"]) {
      await page.goto(path);
      await expect(page.locator("h1").first()).toBeVisible();
      expect(await pageOverflow(page), path).toBeLessThanOrEqual(1);
    }
  });

  test("console admin não extravasa em 1024px", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await loginPreview(page);
    await page.goto("/dev");
    await page.getByRole("button", { name: "Painel administrativo" }).click();
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    expect(await pageOverflow(page)).toBeLessThanOrEqual(1);

    await page.goto("/admin/equipment");
    await expect(page.getByRole("heading", { name: "Biblioteca de Equipamentos" })).toBeVisible();
    expect(await pageOverflow(page)).toBeLessThanOrEqual(1);
  });
});
