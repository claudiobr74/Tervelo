import { expect, test } from "@playwright/test";

async function loginPreview(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("lucas.atleta@gmail.com");
  await page.getByLabel("Senha").fill("senha12345");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/onboarding\/perfil/);
}

test.describe("console admin", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("atleta sem papel admin volta para a home", async ({ page }) => {
    await loginPreview(page);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/$/);
  });

  test("dashboard, usuários e auditoria no desktop", async ({ page }) => {
    await loginPreview(page);
    await page.goto("/");
    await page.getByRole("button", { name: "Dashboard admin" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByText("Usuários Ativos", { exact: true })).toBeVisible();
    await expect(page.getByText("1.247")).toBeVisible();
    await expect(page.getByText("Custos de API Inteligência Artificial")).toBeVisible();
    await expect(page.getByText("Aderência Crítica")).toBeVisible();

    await page.getByRole("link", { name: "Usuários" }).click();
    await expect(page).toHaveURL(/\/admin\/users/);
    await expect(page.getByRole("heading", { name: "Usuários" })).toBeVisible();
    await expect(page.getByText("Lucas Mendes").first()).toBeVisible();
    await expect(page.getByText("Amanda Santos")).toBeVisible();
    await page.getByPlaceholder("Pesquisar usuário...").fill("carla");
    await expect(page.getByText("Carla Oliveira")).toBeVisible();
    await expect(page.getByText("Amanda Santos")).toHaveCount(0);

    await page.getByRole("link", { name: "Auditoria" }).click();
    await expect(page).toHaveURL(/\/admin\/audit/);
    await expect(page.getByRole("heading", { name: "Auditoria e Decisões da IA" })).toBeVisible();
    await expect(page.getByText("Redução de Volume")).toBeVisible();
    await expect(page.getByText("Protocolo de recuperação v3.2")).toBeVisible();
    await page.getByRole("button", { name: /Amanda Santos/ }).click();
    await expect(page.getByText("repetições em reserva")).toBeVisible();
  });

  test("dashboard admin no tema claro", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("tervelo-theme", "light");
    });
    await loginPreview(page);
    await page.goto("/");
    await page.getByRole("button", { name: "Dashboard admin" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.locator("html")).not.toHaveClass(/dark/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByText("Treinos Realizados Hoje")).toBeVisible();
  });
});
