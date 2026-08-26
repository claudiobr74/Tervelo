import { expect, test } from "@playwright/test";

async function loginPreview(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("lucas.atleta@gmail.com");
  await page.getByLabel("Senha").fill("senha12345");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/onboarding\/perfil/);
}

test("admin escolhe o agente de IA no contrato", async ({ page }) => {
  await loginPreview(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Inteligência Artificial (admin)" }).click();
  await expect(page).toHaveURL(/\/admin\/ai/);
  await expect(page.getByRole("heading", { name: "Inteligência Artificial" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Contrato da Inteligência Artificial" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "Orquestrador" })).toBeChecked();
  await page.getByRole("radio", { name: "Recuperação" }).click();
  await expect(page.getByRole("radio", { name: "Recuperação" })).toBeChecked();
  await expect(page.getByText("Agente ativo: Recuperação")).toBeVisible();
  await expect(page.getByText("Identidade e Papel Base")).toBeVisible();
  await expect(page.getByText("Progressão de carga")).toBeVisible();
});

test("contrato de IA no tema claro", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("tervelo-theme", "light");
  });
  await loginPreview(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Inteligência Artificial (admin)" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("heading", { name: "Contrato da Inteligência Artificial" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "Controle de qualidade" })).toBeVisible();
});
