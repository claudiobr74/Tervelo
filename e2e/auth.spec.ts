import { expect, test } from "@playwright/test";

test("login mostra marca, entrar e criar conta", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("img", { name: "TERVELO" })).toBeVisible();
  await expect(page.getByText("Sua jornada para alta performance começa aqui.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Criar conta" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Google" })).toBeEnabled();
});

test("cadastro local abre o onboarding", async ({ page }) => {
  await page.goto("/signup");
  await page.getByLabel("Nome completo").fill("Ana Silva");
  await page.getByLabel("E-mail").fill("ana.nova@tervelo.app");
  await page.getByLabel("Senha", { exact: true }).fill("senha12345");
  await page.getByLabel("Confirmar senha").fill("senha12345");
  await page.getByRole("button", { name: "Criar minha conta" }).click();
  await expect(page).toHaveURL(/\/onboarding\/perfil/);
  await expect(page.getByRole("heading", { name: "Sobre você" })).toBeVisible();
});

test("onboarding sem sessão volta para login", async ({ page }) => {
  await page.goto("/onboarding/perfil");
  await expect(page).toHaveURL(/\/login/);
});

test("login local abre onboarding e Google tenta o provedor de verdade", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("button", { name: "Google" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Apple" })).toBeEnabled();
  await page.getByRole("button", { name: "Google" }).click();
  await expect(page.getByText(/precisa do Nhost|e-mail e senha/i)).toBeVisible();
  await page.getByLabel("E-mail").fill("lucas.atleta@gmail.com");
  await page.getByLabel("Senha").fill("senha12345");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/onboarding\/perfil/);
  await expect(page.getByText("Etapa 1 de 5")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sobre você" })).toBeVisible();
});

test("finalizar as cinco etapas abre o app mesmo sem backend Nhost", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("lucas.atleta@gmail.com");
  await page.getByLabel("Senha").fill("senha12345");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/onboarding\/perfil/);

  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page).toHaveURL(/\/onboarding\/medidas/);
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page).toHaveURL(/\/onboarding\/experiencia/);
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page).toHaveURL(/\/onboarding\/objetivos/);
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page).toHaveURL(/\/onboarding\/nutricao/);

  const profileResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/api/onboarding/profile") && response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Finalizar" }).click();
  const saved = await profileResponse;
  expect(saved.status()).toBe(200);
  const body = (await saved.json()) as { ok?: boolean };
  expect(body.ok).toBe(true);

  await expect(page).toHaveURL(/\/app\/today/);
  await expect(page.getByText("Não foi possível salvar suas respostas")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: /^Olá/ })).toBeVisible();
});

test("esqueci senha abre a tela real", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("link", { name: "Esqueci minha senha" }).click();
  await expect(page).toHaveURL(/\/forgot-password/);
  await page.getByLabel("E-mail").fill("lucas.atleta@gmail.com");
  await page.getByRole("button", { name: "Enviar instruções" }).click();
  await expect(page.getByText(/Se o e-mail existir/)).toBeVisible();
});

test("configurações do atleta permitem sair da conta", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("lucas.atleta@gmail.com");
  await page.getByLabel("Senha").fill("senha12345");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/onboarding\/perfil/);

  await page.goto("/app/settings");
  await expect(page.getByRole("heading", { name: "Conta" })).toBeVisible();
  await page.getByRole("button", { name: "Sair da conta" }).click();
  await expect(page).toHaveURL(/\/login/);

  await page.goto("/app/today");
  await expect(page).toHaveURL(/\/login/);
});
