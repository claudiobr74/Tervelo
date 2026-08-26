import { expect, test } from "@playwright/test";

test("login mostra marca, entrar e criar conta", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByText("TERVELO")).toBeVisible();
  await expect(page.getByText("Sua jornada para alta performance começa aqui.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Criar conta" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Google" })).toBeDisabled();
});

test("cadastro mostra campos do Figma", async ({ page }) => {
  await page.goto("/signup");
  await expect(page.getByRole("heading", { name: "Crie sua conta" })).toBeVisible();
  await expect(page.getByText("Nome completo", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Criar minha conta" })).toBeVisible();
});

test("onboarding sem sessão volta para login", async ({ page }) => {
  await page.goto("/onboarding/perfil");
  await expect(page).toHaveURL(/\/login/);
});
