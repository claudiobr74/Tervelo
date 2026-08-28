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
  await page.goto("/dev");
  await page.getByRole("button", { name: "Inteligência Artificial (admin)" }).click();
  await expect(page).toHaveURL(/\/admin\/ai/);
  await expect(
    page.getByRole("heading", { name: "Inteligência Artificial", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Contrato da Inteligência Artificial" }),
  ).toBeVisible();
  await expect(page.getByText("Rascunho local")).toBeVisible();
  await expect(page.getByRole("button", { name: "Testar versão" })).toBeDisabled();
  await expect(page.getByRole("radio", { name: "Orquestrador" })).toBeChecked();
  await page.getByRole("radio", { name: "Recuperação" }).click();
  await expect(page.getByRole("radio", { name: "Recuperação" })).toBeChecked();
  await expect(page.getByText("Agente ativo: Recuperação")).toBeVisible();
  await expect(page.getByText("Identidade e Papel Base")).toBeVisible();
  await expect(page.getByText("Progressão de carga")).toBeVisible();
  await page.getByRole("tab", { name: "Nutrição" }).click();
  await expect(page.getByText("TERVELO — ADDENDUM")).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Integração obrigatória entre treinamento e nutrição esportiva",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("13. O contexto nutricional relevante foi considerado?"),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Recuperação" }).click();
  await expect(
    page.getByText("21. A preferência de frequência cardíaca está ativa?"),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Segurança" }).click();
  await expect(page.getByText("Não fabricar dados ausentes")).toBeVisible();
  await page.getByRole("tab", { name: "Testes" }).click();
  await expect(page.getByText("31. O check-in diário foi superinterpretado?")).toBeVisible();
});

test("contrato de IA no tema claro", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("tervelo-theme", "light");
  });
  await loginPreview(page);
  await page.goto("/dev");
  await page.getByRole("button", { name: "Inteligência Artificial (admin)" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(
    page.getByRole("heading", { name: "Contrato da Inteligência Artificial" }),
  ).toBeVisible();
  await expect(page.getByRole("radio", { name: "Controle de qualidade" })).toBeVisible();
});
