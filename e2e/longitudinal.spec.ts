import { expect, test } from "@playwright/test";

async function loginPreview(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    window.localStorage.removeItem("tervelo-live-session");
    window.localStorage.removeItem("tervelo-set-result-queue");
    window.localStorage.removeItem("tervelo-longitudinal");
  });
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("lucas.atleta@gmail.com");
  await page.getByLabel("Senha").fill("senha12345");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/onboarding\/perfil/);
}

test.describe("longitudinal", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("hoje abre recuperação, confirma check-in e navega evolução e corpo", async ({ page }) => {
    await loginPreview(page);
    await page.goto("/app/today");
    await expect(page.getByRole("heading", { name: "Olá, Lucas." })).toBeVisible();
    await page.getByRole("link", { name: /Recuperação/ }).click();
    await expect(page).toHaveURL(/\/app\/recovery/);
    await expect(page.getByRole("heading", { name: "Como você está se sentindo?" })).toBeVisible();
    await expect(page.getByText("Recuperação de hoje: Boa")).toBeVisible();
    await page.getByRole("slider", { name: "Como você dormiu?" }).fill("5");
    await expect(page.getByText("Excelente").first()).toBeVisible();
    await page.getByRole("button", { name: "Confirmar check-in" }).click();
    await expect(page).toHaveURL(/\/app\/today/);

    await page.getByRole("link", { name: "Evolução" }).click();
    await expect(page).toHaveURL(/\/app\/progress/);
    await expect(page.getByRole("heading", { name: "Evolução" })).toBeVisible();
    await expect(page.getByText("Progressão no Supino Reto")).toBeVisible();
    await expect(page.getByText("82 kg")).toBeVisible();

    await page.getByRole("button", { name: "Medidas" }).click();
    await expect(page).toHaveURL(/\/app\/body/);
    await expect(page.getByRole("heading", { name: "Corpo e Medidas" })).toBeVisible();
    await expect(page.getByText("82,4 kg")).toHaveCount(0);
    await expect(
      page.getByText("Registre sua primeira medida").or(page.getByText("—").first()),
    ).toBeVisible();
  });

  test("recuperação funciona no tema claro", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("tervelo-theme", "light");
    });
    await loginPreview(page);
    await page.goto("/app/recovery");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.locator("html")).not.toHaveClass(/dark/);
    await expect(page.getByRole("heading", { name: "Como você está se sentindo?" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Pular" })).toBeVisible();
  });
});
