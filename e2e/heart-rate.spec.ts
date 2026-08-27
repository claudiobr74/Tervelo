import { expect, test } from "@playwright/test";
import { captureEvidence } from "./support/evidence";

async function loginPreview(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.evaluate(() => {
    window.localStorage.removeItem("tervelo-live-session");
    window.localStorage.removeItem("tervelo-set-result-queue");
    window.localStorage.removeItem("tervelo-heart-rate-enabled");
    window.localStorage.removeItem("tervelo-heart-rate-session");
  });
  await page.getByLabel("E-mail").fill("lucas.atleta@gmail.com");
  await page.getByLabel("Senha").fill("senha12345");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/onboarding\/perfil/);
}

async function skipPreWorkout(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: "Pular por hoje" }).click();
}

test.describe("frequência cardíaca", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("nasce desligada e não aparece no treino", async ({ page }) => {
    await loginPreview(page);
    await page.goto("/app/settings");
    await expect(page.getByRole("heading", { name: "Treino e dispositivos" })).toBeVisible();
    const toggle = page.getByRole("switch", { name: "Usar frequência cardíaca durante os treinos" });
    await expect(toggle).toHaveAttribute("aria-checked", "false");
    await expect(page.getByRole("button", { name: "Conectar frequencímetro" })).toHaveCount(0);

    await page.goto("/app/today");
    await page.getByRole("button", { name: "Iniciar treino" }).click();
    await skipPreWorkout(page);
    await page.getByRole("button", { name: "Começar exercício" }).click();
    await expect(page.getByRole("heading", { name: "Supino Reto" })).toBeVisible();
    await expect(page.getByLabel("Frequência cardíaca")).toHaveCount(0);
  });

  test("ativar mostra dispositivo e o treino segue sem BLE", async ({ page }) => {
    await loginPreview(page);
    await page.goto("/app/settings");
    await page.getByRole("switch", { name: "Usar frequência cardíaca durante os treinos" }).click();
    await expect(page.getByRole("switch", { name: "Usar frequência cardíaca durante os treinos" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await expect(
      page.getByText("Este navegador não oferece conexão direta com frequencímetros Bluetooth."),
    ).toBeVisible();
    await expect(page.getByText("O treino continuará funcionando normalmente.")).toBeVisible();

    await page.goto("/app/today");
    await page.getByRole("button", { name: "Iniciar treino" }).click();
    await skipPreWorkout(page);
    await page.getByRole("button", { name: "Começar exercício" }).click();
    await expect(page.getByLabel("Frequência cardíaca")).toBeVisible();
    await expect(page.getByRole("button", { name: "Registrar aquecimento" })).toBeEnabled();
  });

  test("settings funciona no tema claro", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("tervelo-theme", "light");
    });
    await loginPreview(page);
    await page.goto("/app/settings");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.getByRole("heading", { name: "Treino e dispositivos" })).toBeVisible();
  });

  test("frequência cardíaca aparece no treino nos dois temas", async ({ page }, testInfo) => {
    await loginPreview(page);
    await page.goto("/app/settings");
    await expect(page.getByRole("switch", { name: "Usar frequência cardíaca durante os treinos" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
    await captureEvidence(page, testInfo, "fc_desligada_escuro_390");

    await page.getByRole("switch", { name: "Usar frequência cardíaca durante os treinos" }).click();
    await expect(page.getByRole("switch", { name: "Usar frequência cardíaca durante os treinos" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await captureEvidence(page, testInfo, "fc_ligada_escuro_390");

    await page.goto("/app/today");
    await page.getByRole("button", { name: "Iniciar treino" }).click();
    await skipPreWorkout(page);
    await page.getByRole("button", { name: "Começar exercício" }).click();
    await expect(page.getByLabel("Frequência cardíaca")).toBeVisible();
    await captureEvidence(page, testInfo, "fc_treino_escuro_390");

    await page.evaluate(() => window.localStorage.setItem("tervelo-theme", "light"));
    await page.goto("/app/settings");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.getByRole("switch", { name: "Usar frequência cardíaca durante os treinos" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await captureEvidence(page, testInfo, "fc_ligada_claro_390");

    await page.goto("/app/workout/exercise");
    await expect(page.getByLabel("Frequência cardíaca")).toBeVisible();
    await captureEvidence(page, testInfo, "fc_treino_claro_390");
  });
});
