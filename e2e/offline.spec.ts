import { expect, test } from "@playwright/test";
import { captureEvidence } from "./support/evidence";

async function loginPreview(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase("tervelo-offline");
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
      req.onblocked = () => resolve();
    });
    window.localStorage.removeItem("tervelo-live-session");
    window.localStorage.removeItem("tervelo-set-result-queue");
    window.localStorage.removeItem("tervelo-athlete-state");
  });
  await page.getByLabel("E-mail").fill("lucas.atleta@gmail.com");
  await page.getByLabel("Senha").fill("senha12345");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/onboarding\/perfil/);
}

async function waitBoot(page: import("@playwright/test").Page) {
  await expect(page.locator("body")).toHaveAttribute("data-offline-boot", "ready", {
    timeout: 10_000,
  });
}

test.describe("offline", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("configurações mostram dados e sincronização", async ({ page }) => {
    await loginPreview(page);
    await page.goto("/app/settings");
    await waitBoot(page);
    await expect(page.getByRole("heading", { name: "Dados e sincronização" })).toBeVisible();
    await expect(page.getByText("Próximo treino disponível offline")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sincronizar agora" })).toBeVisible();
    await expect(page.getByText("O Tervelo mantém os dados necessários")).toBeVisible();
  });

  test("reload não recupera treino inventado", async ({ page }) => {
    await loginPreview(page);
    await page.goto("/app/today");
    await waitBoot(page);
    await expect(page.getByRole("heading", { name: "Nenhum treino prescrito" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Iniciar treino" })).toHaveCount(0);
    await page.reload();
    await waitBoot(page);
    await expect(page.getByRole("heading", { name: "Nenhum treino prescrito" })).toBeVisible();
    await expect(page.getByText("Treino em andamento")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Continuar treino" })).toHaveCount(0);
  });

  test("dados e sincronização funcionam nos dois temas", async ({ page }, testInfo) => {
    await loginPreview(page);
    await page.goto("/app/settings");
    await waitBoot(page);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.getByRole("heading", { name: "Dados e sincronização" })).toBeVisible();
    await captureEvidence(page, testInfo, "sincronizacao_claro_390");

    await page.evaluate(() => window.localStorage.setItem("tervelo-theme", "dark"));
    await page.goto("/app/settings");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.getByRole("heading", { name: "Dados e sincronização" })).toBeVisible();
    await captureEvidence(page, testInfo, "sincronizacao_escuro_390");

    await page.goto("/app/today");
    await expect(page.getByRole("heading", { name: "Nenhum treino prescrito" })).toBeVisible();
    await captureEvidence(page, testInfo, "hoje_escuro_390");
  });
});
