import { expect, test } from "@playwright/test";

async function loginPreview(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("lucas.atleta@gmail.com");
  await page.getByLabel("Senha").fill("senha12345");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/onboarding\/perfil/);
}

test.describe("console admin", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("atleta sem papel admin volta para a home", async ({ page }) => {
    await loginPreview(page);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/$/);
  });

  test("admin deslogado abre o login e, com papel, entra no console", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login\?next=/);

    await loginPreview(page);
    await page.goto("/dev");
    await page.getByRole("button", { name: "Painel administrativo" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

    await page.goto("/login");
    await expect(page).toHaveURL(/\/admin/);
  });

  test("dashboard, usuários e auditoria no desktop", async ({ page }) => {
    await loginPreview(page);
    await page.goto("/dev");
    await page.getByRole("button", { name: "Painel administrativo" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByText("Usuários Ativos", { exact: true })).toBeVisible();
    await expect(page.getByText("1.247")).toHaveCount(0);
    await expect(page.getByText("Lucas Mendes")).toHaveCount(0);
    await expect(page.getByText("Aderência Crítica")).toHaveCount(0);

    await page.getByRole("link", { name: "Usuários" }).click();
    await expect(page).toHaveURL(/\/admin\/users/);
    await expect(page.getByRole("heading", { name: "Usuários" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Nenhum atleta|Banco indisponível/ }),
    ).toBeVisible();
    await expect(page.getByText("Amanda Santos")).toHaveCount(0);
    await page.getByPlaceholder("Pesquisar usuário...").fill("carla");
    await expect(page.getByText("Carla Oliveira")).toHaveCount(0);

    await page.getByRole("link", { name: "Auditoria" }).click();
    await expect(page).toHaveURL(/\/admin\/audit/);
    await expect(page.getByRole("heading", { name: "Auditoria e Decisões da IA" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Nenhuma decisão registrada|Banco indisponível/ }),
    ).toBeVisible();
    await expect(page.getByText("Redução de Volume")).toHaveCount(0);
  });

  test("dashboard admin no tema claro", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("tervelo-theme", "light");
    });
    await loginPreview(page);
    await page.goto("/dev");
    await page.getByRole("button", { name: "Painel administrativo" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.locator("html")).not.toHaveClass(/dark/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByText("Treinos Realizados Hoje")).toBeVisible();
  });

  test("dashboard e usuários não encavalam em laptop 1280", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginPreview(page);
    await page.goto("/dev");
    await page.getByRole("button", { name: "Painel administrativo" }).click();
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

    const kpis = page.locator("article").filter({ hasText: "Usuários Ativos" });
    await expect(kpis.first()).toBeVisible();
    const overlap = await page.locator("main article").evaluateAll((els) => {
      const boxes = els.map((el) => {
        const r = el.getBoundingClientRect();
        return {
          left: r.left,
          right: r.right,
          top: r.top,
          bottom: r.bottom,
          text: el.textContent?.slice(0, 40),
        };
      });
      for (let i = 0; i < boxes.length; i += 1) {
        for (let j = i + 1; j < boxes.length; j += 1) {
          const a = boxes[i];
          const b = boxes[j];
          const hit =
            a.left < b.right - 1 &&
            b.left < a.right - 1 &&
            a.top < b.bottom - 1 &&
            b.top < a.bottom - 1;
          if (hit) return `${a.text} ∩ ${b.text}`;
        }
      }
      return null;
    });
    expect(overlap).toBeNull();

    const pageOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(pageOverflow).toBeLessThanOrEqual(1);

    await page.getByRole("link", { name: "Usuários" }).click();
    await expect(page.getByRole("heading", { name: "Usuários" })).toBeVisible();
    await expect(page.getByText("Lucas Mendes")).toHaveCount(0);
    const usersOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(usersOverflow).toBeLessThanOrEqual(1);
  });

  test("Treinamento, Nutrição e Configurações abrem sem travar", async ({ page }) => {
    await loginPreview(page);
    await page.goto("/dev");
    await page.getByRole("button", { name: "Painel administrativo" }).click();
    await expect(page).toHaveURL(/\/admin$/);

    await page.getByRole("link", { name: /Treinamento/ }).click();
    await expect(page).toHaveURL(/\/admin\/training$/);
    await expect(page.getByRole("heading", { name: "Treinamento", exact: true })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Nenhum programa no banco|Banco indisponível/ }),
    ).toBeVisible();

    await page.getByRole("link", { name: /Nutrição/ }).click();
    await expect(page).toHaveURL(/\/admin\/nutrition$/);
    await expect(
      page.getByRole("heading", { name: /Nenhuma nutrição no banco|Banco indisponível/ }),
    ).toBeVisible();

    await page.getByRole("link", { name: /Configurações/ }).click();
    await expect(page).toHaveURL(/\/admin\/settings$/);
    await expect(page.getByRole("heading", { name: "Configurações", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Criar academia" })).toBeVisible();

    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByLabel("Buscar atletas e exercícios")).toBeEnabled();
    await expect(page.getByRole("button", { name: "Avisos administrativos" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Ajuda do painel" })).toBeEnabled();
  });
});
