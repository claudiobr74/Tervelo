#!/usr/bin/env npx tsx
/**
 * Smoke HTTP do deploy. Uso: npm run smoke:deploy -- https://exemplo.vercel.app
 * Código 2 = SSO Vercel (Deployment Protection). Código 1 = app doente.
 */

const SSO_HINT = "vercel.com/sso-api";

async function main() {
  const base = (process.argv[2] || process.env.SMOKE_URL || "").replace(/\/$/, "");
  if (!base) {
    console.error("Uso: npm run smoke:deploy -- <url>");
    process.exit(1);
  }

  const healthUrl = `${base}/api/health`;
  const healthRes = await fetch(healthUrl, { redirect: "manual" });
  const location = healthRes.headers.get("location") ?? "";

  if (healthRes.status >= 300 && healthRes.status < 400 && location.includes(SSO_HINT)) {
    console.error(
      JSON.stringify({
        ok: false,
        reason: "vercel_sso",
        status: healthRes.status,
        hint: "Preview protegido. Entre com a conta Vercel ou desative SSO no Preview. Production deve ficar pública.",
      }),
    );
    process.exit(2);
  }

  if (!healthRes.ok) {
    console.error(JSON.stringify({ ok: false, reason: "health_http", status: healthRes.status }));
    process.exit(1);
  }

  const health = (await healthRes.json()) as Record<string, unknown>;
  if (health.status !== "ok" || health.service !== "tervelo-web") {
    console.error(JSON.stringify({ ok: false, reason: "health_payload", health }));
    process.exit(1);
  }

  const loginRes = await fetch(`${base}/login`, { redirect: "manual" });
  if (loginRes.status >= 300 && loginRes.status < 400 && (loginRes.headers.get("location") ?? "").includes(SSO_HINT)) {
    console.error(JSON.stringify({ ok: false, reason: "vercel_sso", path: "/login" }));
    process.exit(2);
  }
  if (!loginRes.ok) {
    console.error(JSON.stringify({ ok: false, reason: "login_http", status: loginRes.status }));
    process.exit(1);
  }

  console.log(
    JSON.stringify({
      ok: true,
      health,
      login: loginRes.status,
      nosniff: loginRes.headers.get("x-content-type-options"),
    }),
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
