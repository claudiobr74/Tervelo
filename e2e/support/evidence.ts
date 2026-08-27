import type { Page, TestInfo } from "@playwright/test";

/**
 * Evidência visual gravada dentro do próprio resultado do teste.
 * Caminhos absolutos fora do repositório não existem em outra máquina nem no CI.
 */
export async function captureEvidence(page: Page, testInfo: TestInfo, name: string) {
  const path = testInfo.outputPath(`${name}.png`);
  await page.screenshot({ path, fullPage: true });
  await testInfo.attach(name, { path, contentType: "image/png" });
}
