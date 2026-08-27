import { expect, test } from "@playwright/test";

async function loginPreview(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    window.localStorage.removeItem("tervelo-live-session");
    window.localStorage.removeItem("tervelo-set-result-queue");
  });
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("lucas.atleta@gmail.com");
  await page.getByLabel("Senha").fill("senha12345");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/onboarding\/perfil/);
}

test.describe("treino", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("hoje não inventa sessão nem inicia treino de exemplo", async ({ page }) => {
    await loginPreview(page);
    await page.goto("/app/today");
    await expect(page.getByRole("heading", { name: "Olá, Lucas." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Nenhum treino prescrito" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Iniciar treino" })).toHaveCount(0);
    await expect(page.getByText("Peitoral e Tríceps")).toHaveCount(0);
    await expect(page.getByText("Sem refeições registradas hoje")).toBeVisible();
    await expect(page.getByText("Sem histórico de carga")).toBeVisible();

    await page.goto("/app/workout");
    await expect(page.getByRole("heading", { name: "Nenhum treino prescrito" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Começar exercício" })).toHaveCount(0);
  });

  test("hoje funciona no tema claro", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("tervelo-theme", "light");
    });
    await loginPreview(page);
    await page.goto("/app/today");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.locator("html")).not.toHaveClass(/dark/);
    await expect(page.getByRole("heading", { name: "Olá, Lucas." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Nenhum treino prescrito" })).toBeVisible();
  });
});
