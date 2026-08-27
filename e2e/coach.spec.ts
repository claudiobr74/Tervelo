import { expect, test } from "@playwright/test";

async function loginPreview(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    window.localStorage.removeItem("tervelo.preview.coachProposal.v1");
  });
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("lucas.atleta@gmail.com");
  await page.getByLabel("Senha").fill("senha12345");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/onboarding\/perfil/);
}

test.describe("coach", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("hoje abre o treinador com chips e proposta", async ({ page }) => {
    await loginPreview(page);
    await page.goto("/app/today");
    await page.getByRole("link", { name: "Coach" }).click();
    await expect(page).toHaveURL(/\/app\/coach/);
    await expect(page.getByRole("heading", { name: "Seu treinador" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Como está minha evolução?" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Por que meu treino mudou?" })).toBeVisible();
    await expect(page.getByText("Mudança proposta")).toBeVisible();
    await expect(page.getByText("80kg")).toBeVisible();
    await expect(page.getByText("82kg")).toBeVisible();
    await expect(page.getByText("repetições em reserva")).toBeVisible();
    await expect(page.getByText("RIR")).toHaveCount(0);

    await page.getByRole("button", { name: "Como está minha evolução?" }).click();
    await expect(page.getByText("Papel da nutrição")).toBeVisible();
    await expect(page.getByText(/UNKNOWN/)).toBeVisible();

    await page.getByRole("button", { name: "Aceitar alteração" }).click();
    await expect(page.getByText("Alteração aceita")).toBeVisible();

    await page.getByRole("link", { name: "Quero entender" }).click();
    await expect(page).toHaveURL(/\/app\/coach\/ajuste/);
    // Sem check-in que gere adaptação, a tela não inventa um ajuste.
    await expect(page.getByRole("heading", { name: "Nada foi ajustado hoje" })).toBeVisible();
    await expect(
      page.getByText("segue exatamente como foi planejada", { exact: false }),
    ).toBeVisible();
  });

  test("ajuste de hoje mostra o que o check-in realmente mudou", async ({ page }) => {
    await loginPreview(page);
    await page.goto("/app/workout/checkin");
    await page.getByRole("button", { name: "Muito bom" }).click();
    await page.getByRole("button", { name: "Muito boa" }).click();
    await page.getByRole("button", { name: "Bem recuperado" }).click();
    await page.getByRole("button", { name: "Baixo" }).click();
    await page.getByRole("button", { name: "Não" }).click();
    await page.getByRole("button", { name: /Tenho aproximadamente/ }).click();
    await page.getByRole("button", { name: "40" }).click();
    await page.getByRole("button", { name: "Começar treino" }).click();
    await expect(page).toHaveURL(/\/app\/workout$/);

    await page.goto("/app/coach/ajuste");
    await expect(page.getByRole("heading", { name: "Seu plano foi ajustado" })).toBeVisible();
    await expect(page.getByText("cerca de 40 minutos", { exact: false })).toBeVisible();
    await expect(page.getByText("Check-in Pré-Treino", { exact: false })).toBeVisible();
  });

  test("coach funciona no tema claro", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("tervelo-theme", "light");
      window.localStorage.removeItem("tervelo.preview.coachProposal.v1");
    });
    await loginPreview(page);
    await page.goto("/app/coach");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.locator("html")).not.toHaveClass(/dark/);
    await expect(page.getByRole("heading", { name: "Seu treinador" })).toBeVisible();
    await expect(page.getByText("Sugerido")).toBeVisible();
    await expect(page.getByRole("button", { name: "Devo aumentar a carga?" })).toBeVisible();
  });
});
