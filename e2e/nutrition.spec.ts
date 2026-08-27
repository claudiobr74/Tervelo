import { expect, test } from "@playwright/test";

async function loginPreview(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("lucas.atleta@gmail.com");
  await page.getByLabel("Senha").fill("senha12345");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/onboarding\/perfil/);
}

test.describe("nutrição", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("hoje abre nutrição com targets e refeições", async ({ page }) => {
    await loginPreview(page);
    await page.goto("/app/today");
    await page.getByRole("link", { name: /Nutrição/ }).click();
    await expect(page).toHaveURL(/\/app\/nutrition/);
    await expect(page.getByRole("heading", { name: "Nutrição" })).toBeVisible();
    await expect(page.getByText("Aumentar massa muscular com controle do ganho de gordura")).toBeVisible();
    await expect(page.getByText("2.450")).toBeVisible();
    await expect(page.getByText("/ 3.100 kcal")).toBeVisible();
    await expect(page.getByText("Proteínas")).toBeVisible();
    await expect(page.getByText("Café da manhã")).toBeVisible();
    await expect(page.getByText("Lanche pré-treino", { exact: true })).toBeVisible();
    await expect(page.getByText("Recomendações do nutricionista virtual")).toBeVisible();
    await page.getByRole("link", { name: "Mais" }).click();
    await expect(page).toHaveURL(/\/app\/profile/);
    await page.getByRole("link", { name: "Nutrição" }).click();
    await expect(page).toHaveURL(/\/app\/nutrition/);
  });

  test("nutrição funciona no tema claro", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("tervelo-theme", "light");
    });
    await loginPreview(page);
    await page.goto("/app/nutrition");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.locator("html")).not.toHaveClass(/dark/);
    await expect(page.getByRole("heading", { name: "Nutrição" })).toBeVisible();
    await expect(page.getByText("Hidratação")).toBeVisible();
    await expect(page.getByText("2,1")).toBeVisible();
  });
});
