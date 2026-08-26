import { expect, test } from "@playwright/test";

async function loginPreview(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.evaluate(() => {
    window.localStorage.removeItem("tervelo-live-session");
    window.localStorage.removeItem("tervelo-athlete-state");
    window.localStorage.removeItem("tervelo-pre-workout-checkin-enabled");
    window.localStorage.removeItem("tervelo-weekly-coach-review-enabled");
  });
  await page.getByLabel("E-mail").fill("lucas.atleta@gmail.com");
  await page.getByLabel("Senha").fill("senha12345");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/onboarding\/perfil/);
}

test.describe("estado do atleta", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("check-in pré-treino pode ser pulado e não bloqueia o treino", async ({ page }) => {
    await loginPreview(page);
    await page.goto("/app/today");
    await expect(page.getByRole("heading", { name: "Como você está para treinar hoje?" })).toBeVisible();
    await page.getByRole("link", { name: "Fazer check-in" }).click();
    await expect(page).toHaveURL(/\/app\/workout\/checkin/);
    await expect(page.getByText("Check-in Pré-Treino")).toBeVisible();
    await expect(page.getByRole("button", { name: "Começar treino" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Enviar formulário" })).toHaveCount(0);
    await page.getByRole("button", { name: "Pular por hoje" }).click();
    await expect(page).toHaveURL(/\/app\/workout$/);
    await expect(page.getByRole("heading", { name: "Peitoral e Tríceps" })).toBeVisible();
  });

  test("check-in completo e pouco tempo abrem ajuste de hoje", async ({ page }) => {
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
    await page.goto("/app/today");
    await expect(page.getByRole("link", { name: "Ver ajuste de hoje" })).toBeVisible();
  });

  test("revisão semanal e configurações nascem ligadas", async ({ page }) => {
    await loginPreview(page);
    await page.goto("/app/settings");
    await expect(page.getByRole("switch", { name: "Ativar Check-in Pré-Treino" })).toHaveAttribute("aria-checked", "true");
    await expect(page.getByRole("switch", { name: "Ativar Revisão Semanal do Coach" })).toHaveAttribute(
      "aria-checked",
      "true",
    );

    await page.goto("/app/coach");
    await page.getByRole("link", { name: "Revisões Semanais do Coach" }).click();
    await expect(page.getByRole("heading", { name: "Revisões" })).toBeVisible();
    await expect(page.getByText("Semana consistente")).toBeVisible();
    await expect(page.getByText("Plano mantido").first()).toBeVisible();
    await page.getByText("Semana consistente").click();
    await expect(page.getByRole("heading", { name: "Revisão Semanal do Coach" })).toBeVisible();
    await expect(page.getByText("Visão geral")).toBeVisible();
    await expect(page.getByText("Athlete State")).toHaveCount(0);
    await expect(page.getByText("Weekly Coach Review")).toHaveCount(0);
  });

  test("check-out no resumo pode ser pulado", async ({ page }) => {
    await loginPreview(page);
    await page.goto("/app/workout/summary");
    await expect(page.getByRole("heading", { name: "Treino Concluído!" })).toBeVisible();
    await expect(page.getByText("Check-out Pós-Treino")).toBeVisible();
    await page.getByRole("button", { name: "Concluir sem responder" }).click();
    await expect(page.getByText("Check-out concluído")).toBeVisible();
  });

  test("captura Light/Dark 390", async ({ page }) => {
    const stamp = Date.now();
    await loginPreview(page);
    await page.goto("/app/workout/checkin");
    await page.screenshot({ path: `/opt/cursor/artifacts/athlete_state_checkin_dark_390_${stamp}.png`, fullPage: true });
    await page.goto("/app/coach/revisoes");
    await page.screenshot({ path: `/opt/cursor/artifacts/athlete_state_reviews_dark_390_${stamp}.png`, fullPage: true });
    await page.goto("/app/coach/revisoes/rev-26");
    await page.screenshot({ path: `/opt/cursor/artifacts/athlete_state_review_dark_390_${stamp}.png`, fullPage: true });

    await page.evaluate(() => window.localStorage.setItem("tervelo-theme", "light"));
    await page.goto("/app/workout/checkin");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.screenshot({ path: `/opt/cursor/artifacts/athlete_state_checkin_light_390_${stamp}.png`, fullPage: true });
    await page.goto("/app/coach/revisoes/rev-26");
    await page.screenshot({ path: `/opt/cursor/artifacts/athlete_state_review_light_390_${stamp}.png`, fullPage: true });
    await page.goto("/app/today");
    await page.screenshot({ path: `/opt/cursor/artifacts/athlete_state_today_light_390_${stamp}.png`, fullPage: true });
  });
});
