import { expect, test } from "@playwright/test";

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/termos", "/privacidade"];

test.describe("tema padrão", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("abre no claro em toda tela pública, sem sessão", async ({ page }) => {
    for (const route of PUBLIC_ROUTES) {
      await page.goto(route);
      await expect(page.locator("html"), route).toHaveAttribute("data-theme", "light");
      await expect(page.locator("html"), route).not.toHaveClass(/dark/);
    }
  });

  test("abre no claro mesmo quando o sistema prefere escuro", async ({ browser }) => {
    const context = await browser.newContext({
      colorScheme: "dark",
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.goto("/login");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await context.close();
  });

  test("entra no app no claro e respeita a escolha por escuro", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill("lucas.atleta@gmail.com");
    await page.getByLabel("Senha").fill("senha12345");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/onboarding\/perfil/);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    await page.goto("/app/today");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    await page.goto("/app/settings");
    await page.getByRole("radio", { name: "Escuro" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.goto("/app/today");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });
});
