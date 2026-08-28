import { expect, test } from "@playwright/test";

async function loginPreview(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("lucas.atleta@gmail.com");
  await page.getByLabel("Senha").fill("senha12345");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/onboarding\/perfil/);
}

test("busca de exercícios mostra a biblioteca autorizada", async ({ page }) => {
  await loginPreview(page);
  await page.goto("/app/exercises");
  await expect(page.getByRole("heading", { name: "Exercícios", level: 1 })).toBeVisible();
  await expect(page.getByText("Catálogo vazio")).toHaveCount(0);
  await expect(page.getByText("Puxada Alta Aberta")).toHaveCount(0);
  await expect(page.getByText(/na biblioteca/)).toBeVisible();
  await page.getByLabel("Buscar exercício").fill("Abdução Lateral do Quadril com Alavanca");
  await expect(
    page.getByRole("button", { name: /Abdução Lateral do Quadril com Alavanca/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Abdução Lateral do Quadril com Alavanca/ }).click();
  await expect(
    page.getByRole("heading", { name: "Abdução Lateral do Quadril com Alavanca" }),
  ).toBeVisible();
  await expect(page.getByText(/glúteo médio/i)).toBeVisible();
  const gif = page.getByRole("img", { name: /Abdução Lateral do Quadril com Alavanca/ });
  const missingGif = page.getByText(/O GIF não está neste servidor/);
  await expect(gif.or(missingGif)).toBeVisible();
  if (await gif.isVisible()) {
    await expect(gif).toHaveAttribute(
      "src",
      "/api/catalog/gif/abducao-lateral-do-quadril-com-alavanca",
    );
  }
  await page.getByRole("button", { name: "Voltar à lista" }).click();
  await expect(page.getByText("Biblioteca")).toBeVisible();
});

test("calculadora não monta barra com inventário inventado", async ({ page }) => {
  await loginPreview(page);
  await page.goto("/app/plates");
  await expect(page.getByRole("heading", { name: "Montagem da Barra" })).toBeVisible();
  await expect(page.getByText("40 kg por lado")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: /Nenhuma academia|Banco indisponível/ }),
  ).toBeVisible();
});

test("admin sem papel volta para a home", async ({ page }) => {
  await loginPreview(page);
  await page.goto("/admin/exercises");
  await expect(page).toHaveURL(/\/$/);
});

test("pré-visualização admin de inventário não inventa anilhas", async ({ page }) => {
  await loginPreview(page);
  await page.goto("/dev");
  await page.getByRole("button", { name: "Console admin (pré-visualização)" }).click();
  await expect(page).toHaveURL(/\/admin\/exercises/);
  await expect(page.getByRole("heading", { name: "Biblioteca de Exercícios" })).toBeVisible();
  await expect(page.getByText(/exercícios na biblioteca/)).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Abdução Lateral do Quadril com Alavanca" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Inventário da Academia" }).click();
  await expect(page.getByRole("heading", { name: "Inventário da Academia" })).toBeVisible();
  await expect(page.getByText("1.247")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: /Cadastre uma academia|Banco indisponível/ }),
  ).toBeVisible();
});

test("login e busca funcionam no tema claro", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("tervelo-theme", "light");
  });
  await page.goto("/login");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await expect(page.getByRole("img", { name: "TERVELO" })).toBeVisible();
  await loginPreview(page);
  await page.goto("/app/exercises");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.getByText("Puxada Alta Aberta")).toHaveCount(0);
});
