export const APP_ROLES = {
  user: "user",
  me: "me",
  admin: "admin",
  superAdmin: "super_admin",
} as const;

export type AppRole = (typeof APP_ROLES)[keyof typeof APP_ROLES];

export type AppAccess = "user" | "admin";

const HASURA_CLAIMS = "https://hasura.io/jwt/claims";

type HasuraClaims = {
  "x-hasura-default-role"?: string;
  "x-hasura-allowed-roles"?: string[];
  "x-hasura-user-id"?: string;
};

export function hasAdminAccess(roles: readonly string[]): boolean {
  return roles.includes(APP_ROLES.admin) || roles.includes(APP_ROLES.superAdmin);
}

export function hasSuperAdminAccess(roles: readonly string[]): boolean {
  return roles.includes(APP_ROLES.superAdmin);
}

export function hasUserAccess(roles: readonly string[]): boolean {
  return roles.includes(APP_ROLES.user) || hasAdminAccess(roles);
}

/** Acesso de produto: atleta (`user`) ou administrador (`admin` / `super_admin`). */
export function resolveAppAccess(roles: readonly string[]): AppAccess | null {
  if (hasAdminAccess(roles)) {
    return "admin";
  }
  if (roles.includes(APP_ROLES.user)) {
    return "user";
  }
  return null;
}

export function rolesFromAccessTokenPayload(payload: Record<string, unknown>): string[] {
  const claims = payload[HASURA_CLAIMS] as HasuraClaims | undefined;
  const allowed = claims?.["x-hasura-allowed-roles"] ?? [];
  const defaultRole = claims?.["x-hasura-default-role"];
  return [...new Set([defaultRole, ...allowed].filter((role): role is string => Boolean(role)))];
}

export function userIdFromAccessTokenPayload(payload: Record<string, unknown>): string | null {
  const claims = payload[HASURA_CLAIMS] as HasuraClaims | undefined;
  return claims?.["x-hasura-user-id"] ?? null;
}
