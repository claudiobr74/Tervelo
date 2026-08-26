import { expect, test } from "@playwright/test";

test("página de tokens carrega", async ({ page }) => {
  await page.goto("/dev/tokens");
  await expect(page.getByRole("heading", { name: "Tokens TERVELO" })).toBeVisible();
});

test("alterna tema claro e escuro", async ({ page }) => {
  await page.goto("/dev/tokens");
  await expect(page.locator("html")).toHaveClass(/dark/);

  await page.getByRole("radio", { name: "Claro" }).click();
  await expect(page.getByRole("radio", { name: "Claro" })).toHaveAttribute("aria-checked", "true");
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  await page.getByRole("radio", { name: "Escuro" }).click();
  await expect(page.getByRole("radio", { name: "Escuro" })).toHaveAttribute("aria-checked", "true");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

