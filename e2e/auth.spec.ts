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

test("login local abre onboarding e Google permanece desabilitado", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("button", { name: "Google" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Apple" })).toBeDisabled();
  await page.getByLabel("E-mail").fill("lucas.atleta@gmail.com");
  await page.getByLabel("Senha").fill("senha12345");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/onboarding\/perfil/);
  await expect(page.getByText("Etapa 1 de 5")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sobre você" })).toBeVisible();
});

test("esqueci senha sem tela FIGMA_PENDING", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("lucas.atleta@gmail.com");
  await page.getByRole("button", { name: "Esqueci minha senha" }).click();
  await expect(page.getByText(/Se o e-mail existir/)).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});
