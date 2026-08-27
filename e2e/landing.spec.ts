import { expect, test } from "@playwright/test";

test("a raiz é a landing de marketing, não o scaffold", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Treinamento inteligente/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "Entrar" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Começar minha evolução" }).first()).toBeVisible();
  await expect(page.getByText("Scaffold interno")).toHaveCount(0);
  await expect(page.getByText("Phase 15")).toHaveCount(0);
  await page.getByRole("link", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/login/);
});

test("landing não extravasa em 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});
