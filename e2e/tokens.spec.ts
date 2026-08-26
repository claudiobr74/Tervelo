import { expect, test } from "@playwright/test";

test("página de tokens carrega", async ({ page }) => {
  await page.goto("/dev/tokens");
  await expect(page.getByRole("heading", { name: "Tokens TERVELO" })).toBeVisible();
});
