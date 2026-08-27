import { expect, test } from "@playwright/test";

async function loginPreview(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("lucas.atleta@gmail.com");
  await page.getByLabel("Senha").fill("senha12345");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/onboarding\/perfil/);
}

test.describe("perfil do atleta", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("Mais e o avatar abrem o hub e Dados pessoais persiste medidas", async ({ page }) => {
    await loginPreview(page);
    await page.goto("/app/today");
    await page.getByRole("link", { name: "Perfil" }).click();
    await expect(page).toHaveURL(/\/app\/profile/);
    await expect(page.getByRole("heading", { name: "lucas.atleta" })).toBeVisible();
    await expect(page.getByText("ATLETA PRO")).toHaveCount(0);

    await page.getByRole("link", { name: "Mais" }).click();
    await expect(page).toHaveURL(/\/app\/profile/);

    await page.getByRole("link", { name: "Dados pessoais" }).click();
    await expect(page).toHaveURL(/\/app\/profile\/pessoais/);
    await expect(page.getByRole("heading", { name: "Sobre você" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Suas medidas" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Abrir guia de pontos de medição" }),
    ).toBeVisible();

    await page.getByLabel("Nome preferido").fill("Lucas");
    await page.getByLabel("Tórax (cm)").fill("104");
    await page.getByLabel("Cintura (cm)").fill("84");

    await page.getByRole("button", { name: "Abrir guia de pontos de medição" }).click();
    await expect(page.getByRole("dialog", { name: "Pontos de medição" })).toBeVisible();
    await expect(page.getByRole("img", { name: /ombro, peito, braço contraído/ })).toBeVisible();
    await page.getByRole("button", { name: "Fechar" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);

    await page.getByRole("button", { name: "Salvar" }).click();
    await expect(page).toHaveURL(/\/app\/profile/);
    await expect(page.getByRole("heading", { name: "Lucas" })).toBeVisible();

    await page.getByRole("link", { name: "Dados pessoais" }).click();
    await expect(page.getByLabel("Nome preferido")).toHaveValue("Lucas");
    await expect(page.getByLabel("Tórax (cm)")).toHaveValue("104");
    await expect(page.getByLabel("Cintura (cm)")).toHaveValue("84");
  });

  test("onboarding de medidas mostra o guia e o hub permanece no tema claro", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("tervelo-theme", "light");
    });
    await loginPreview(page);
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page).toHaveURL(/\/onboarding\/medidas/);
    await expect(page.getByRole("heading", { name: "Suas medidas" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Abrir guia de pontos de medição" }),
    ).toBeVisible();
    await page.goto("/app/profile");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.getByRole("link", { name: "Dados pessoais" })).toBeVisible();
  });
});
