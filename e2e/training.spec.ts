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

  test("hoje inicia a sessão, registra série e abre o descanso", async ({ page }) => {
    await loginPreview(page);
    await page.goto("/app/today");
    await expect(page.getByRole("heading", { name: "Olá, Lucas." })).toBeVisible();
    await expect(page.getByText("Peitoral e Tríceps")).toBeVisible();
    await page.getByRole("button", { name: "Iniciar treino" }).click();
    await expect(page.getByRole("heading", { name: "Como você está para treinar hoje?" })).toBeVisible();
    await page.getByRole("button", { name: "Pular por hoje" }).click();
    await expect(page).toHaveURL(/\/app\/workout$/);
    await expect(page.getByRole("heading", { name: "Peitoral e Tríceps" })).toBeVisible();
    await expect(page.getByText("1. Supino Reto")).toBeVisible();
    await page.getByRole("button", { name: "Começar exercício" }).click();
    await expect(page).toHaveURL(/\/app\/workout\/exercise/);
    await expect(page.getByRole("heading", { name: "Supino Reto" })).toBeVisible();
    await expect(page.getByText("Aquecimento 1 de 3")).toBeVisible();
    await page.getByRole("button", { name: "Registrar aquecimento" }).click();
    await page.getByRole("button", { name: "Registrar aquecimento" }).click();
    await page.getByRole("button", { name: "Registrar aquecimento" }).click();
    await expect(page.getByText("Série 1 de 4")).toBeVisible();
    await page.getByRole("button", { name: "Registrar série" }).click();
    await expect(page).toHaveURL(/\/app\/workout\/rest/);
    await expect(page.getByRole("heading", { name: "Descanso" })).toBeVisible();
    await page.getByRole("button", { name: "Pular descanso" }).click();
    await expect(page).toHaveURL(/\/app\/workout\/exercise/);
    await expect(page.getByText("Série 2 de 4")).toBeVisible();
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
    await expect(page.getByRole("button", { name: "Iniciar treino" })).toBeVisible();
  });
});
