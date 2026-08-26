import { expect, test } from "@playwright/test";

async function loginPreview(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("lucas.atleta@gmail.com");
  await page.getByLabel("Senha").fill("senha12345");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/onboarding\/perfil/);
}

test("busca de exercícios filtra puxadas", async ({ page }) => {
  await loginPreview(page);
  await page.goto("/app/exercises");
  await expect(page.getByRole("heading", { name: "Puxada Alta Aberta" })).toBeVisible();
  await expect(page.getByText("Puxada Neutra")).toBeVisible();
  await page.getByLabel("Buscar exercício").fill("supino");
  await expect(page.getByText("Supino Reto com Barra")).toBeVisible();
});

test("calculadora monta 100 kg com barra 20 kg", async ({ page }) => {
  await loginPreview(page);
  await page.goto("/app/plates");
  await expect(page.getByRole("heading", { name: "Montagem da Barra" })).toBeVisible();
  await expect(page.getByText("40 kg por lado").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Confirmar carga" })).toBeEnabled();
});

test("admin sem papel volta para a home", async ({ page }) => {
  await loginPreview(page);
  await page.goto("/admin/exercises");
  await expect(page).toHaveURL(/\/$/);
});
