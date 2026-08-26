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
  await expect(page.getByLabel("Buscar exercício")).toHaveValue("pux");
  await expect(page.getByText("Puxada Alta Aberta").first()).toBeVisible();
  await expect(page.getByText("Puxada Neutra")).toBeVisible();
  await page.getByLabel("Buscar exercício").fill("supino");
  await expect(page.getByText("Supino Reto com Barra").first()).toBeVisible();
  await expect(page.getByText("Puxada Neutra")).toHaveCount(0);
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

test("pré-visualização admin mostra anilha 1,25 kg zerada", async ({ page }) => {
  await loginPreview(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Console admin (pré-visualização)" }).click();
  await expect(page).toHaveURL(/\/admin\/exercises/);
  await page.getByRole("link", { name: "Inventário da Academia" }).click();
  await expect(page.getByText("1,25 kg", { exact: true })).toBeVisible();
  await expect(page.getByText(/1,25 kg com 0 un/)).toBeVisible();
});

test("login e busca funcionam no tema claro", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("tervelo-theme", "light");
  });
  await page.goto("/login");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await expect(page.getByText("TERVELO")).toBeVisible();
  await loginPreview(page);
  await page.goto("/app/exercises");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.getByText("Puxada Alta Aberta").first()).toBeVisible();
});
