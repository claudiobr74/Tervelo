export type DeployTarget = "local" | "preview" | "production";

type DeployEnv = {
  VERCEL_ENV?: string;
  NODE_ENV?: string;
  NEXT_PUBLIC_NHOST_SUBDOMAIN?: string;
};

function readEnv(env?: DeployEnv): DeployEnv {
  return env ?? {
    VERCEL_ENV: process.env.VERCEL_ENV,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_NHOST_SUBDOMAIN: process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN,
  };
}

export function resolveDeployTarget(env?: DeployEnv): DeployTarget {
  const current = readEnv(env);
  if (current.VERCEL_ENV === "production") return "production";
  if (current.VERCEL_ENV === "preview") return "preview";
  if (current.NODE_ENV === "production") return "production";
  return "local";
}

export function isLocalNhostSubdomain(env?: DeployEnv): boolean {
  return (readEnv(env).NEXT_PUBLIC_NHOST_SUBDOMAIN || "local") === "local";
}

/** Sessão `preview` só em dev local ou Preview Vercel **sem** Nhost cloud. Production nunca. */
export function allowPreviewSessions(env?: DeployEnv): boolean {
  const current = readEnv(env);
  const target = resolveDeployTarget(current);
  if (target === "production") return false;
  if (target === "preview") return isLocalNhostSubdomain(current);
  return true;
}

export function nhostMode(env?: DeployEnv): "local-preview" | "configured" {
  return isLocalNhostSubdomain(env) ? "local-preview" : "configured";
}

/**
 * Atalhos de pré-visualização (`/dev`) trocam a sessão por uma de administrador.
 * Só podem existir onde não há backend real para expor.
 */
export function devToolsEnabled(env?: DeployEnv): boolean {
  return allowPreviewSessions(env);
}
