import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PUBLIC_TABLES } from "@/lib/auth/permission-matrix";
import {
  hasAdminAccess,
  hasSuperAdminAccess,
  hasUserAccess,
  resolveAppAccess,
  rolesFromAccessTokenPayload,
} from "@/lib/auth/roles";

describe("acesso usuário e administrador", () => {
  it("atleta tem acesso user e não admin", () => {
    expect(hasUserAccess(["user"])).toBe(true);
    expect(hasAdminAccess(["user"])).toBe(false);
    expect(resolveAppAccess(["user"])).toBe("user");
  });

  it("admin e super_admin têm acesso administrativo", () => {
    expect(hasAdminAccess(["user", "admin"])).toBe(true);
    expect(hasAdminAccess(["super_admin"])).toBe(true);
    expect(hasSuperAdminAccess(["admin"])).toBe(false);
    expect(hasSuperAdminAccess(["super_admin"])).toBe(true);
    expect(resolveAppAccess(["admin"])).toBe("admin");
  });

  it("anônimo não tem acesso de produto", () => {
    expect(resolveAppAccess(["public"])).toBeNull();
    expect(hasUserAccess([])).toBe(false);
  });

  it("lê roles do claim Hasura", () => {
    const roles = rolesFromAccessTokenPayload({
      "https://hasura.io/jwt/claims": {
        "x-hasura-default-role": "user",
        "x-hasura-allowed-roles": ["user", "me", "admin"],
        "x-hasura-user-id": "abc",
      },
    });
    expect(roles).toEqual(["user", "me", "admin"]);
    expect(resolveAppAccess(roles)).toBe("admin");
  });

  it("lê roles quando o claim Hasura vem como JSON string", () => {
    const roles = rolesFromAccessTokenPayload({
      "https://hasura.io/jwt/claims": JSON.stringify({
        "x-hasura-default-role": "admin",
        "x-hasura-allowed-roles": ["user", "me", "admin", "super_admin"],
      }),
    });
    expect(roles).toContain("admin");
    expect(resolveAppAccess(roles)).toBe("admin");
  });
});

describe("matriz Hasura", () => {
  it("nenhuma tabela atleta permite update de set_results para user", () => {
    const setResults = PUBLIC_TABLES.find((table) => table.name === "set_results");
    const user = setResults?.permissions.find((p) => p.role === "user");
    expect(user?.operations.update).toBeUndefined();
    expect(user?.operations.insert).toBeDefined();
    expect(user?.operations.select).toBeDefined();
  });

  it("heart_rate_samples é append-only para user", () => {
    const table = PUBLIC_TABLES.find((item) => item.name === "heart_rate_samples");
    const user = table?.permissions.find((p) => p.role === "user");
    expect(user?.operations.insert).toBeDefined();
    expect(user?.operations.update).toBeUndefined();
    expect(user?.operations.delete).toBeUndefined();
    expect(JSON.stringify(user?.operations.select?.filter)).toContain("X-Hasura-User-Id");
  });

  it("check-ins pré/pós e snapshots do estado são append-only para user", () => {
    for (const name of [
      "pre_workout_checkins",
      "post_workout_checkouts",
      "athlete_state_snapshots",
    ]) {
      const table = PUBLIC_TABLES.find((item) => item.name === name);
      const user = table?.permissions.find((p) => p.role === "user");
      expect(user?.operations.insert, name).toBeDefined();
      expect(user?.operations.update, name).toBeUndefined();
      expect(user?.operations.delete, name).toBeUndefined();
    }
  });

  it("body_measurements é append-only para user", () => {
    const table = PUBLIC_TABLES.find((item) => item.name === "body_measurements");
    const user = table?.permissions.find((p) => p.role === "user");
    expect(user?.operations.insert).toBeDefined();
    expect(user?.operations.update).toBeUndefined();
    expect(user?.operations.delete).toBeUndefined();
  });

  it("nutrition_checkins e nutrition_targets são append-only para user", () => {
    for (const name of ["nutrition_checkins", "nutrition_targets"]) {
      const table = PUBLIC_TABLES.find((item) => item.name === name);
      const user = table?.permissions.find((p) => p.role === "user");
      expect(user?.operations.insert, name).toBeDefined();
      expect(user?.operations.update, name).toBeUndefined();
      expect(user?.operations.delete, name).toBeUndefined();
      expect(JSON.stringify(user?.operations.select?.filter), name).toContain("X-Hasura-User-Id");
    }
  });

  it("revisão semanal isola user e não apaga histórico", () => {
    const reviews = PUBLIC_TABLES.find((item) => item.name === "weekly_coach_reviews");
    const user = reviews?.permissions.find((p) => p.role === "user");
    expect(user?.operations.insert).toBeDefined();
    expect(user?.operations.delete).toBeUndefined();
    expect(user?.operations.update?.columns).toEqual(["status"]);
    expect(JSON.stringify(user?.operations.select?.filter)).toContain("X-Hasura-User-Id");

    const decisions = PUBLIC_TABLES.find((item) => item.name === "weekly_review_decisions");
    const decisionUser = decisions?.permissions.find((p) => p.role === "user");
    expect(decisionUser?.operations.delete).toBeUndefined();
    expect(JSON.stringify(decisionUser?.operations.select?.filter)).toContain("X-Hasura-User-Id");
  });

  it("user não muta equipamentos do catálogo", () => {
    const table = PUBLIC_TABLES.find((item) => item.name === "equipment");
    const user = table?.permissions.find((p) => p.role === "user");
    expect(user?.operations.select).toBeDefined();
    expect(user?.operations.insert).toBeUndefined();
    expect(user?.operations.update).toBeUndefined();
    expect(user?.operations.delete).toBeUndefined();
  });

  it("catálogo é leitura para user e escrita para admin", () => {
    const table = PUBLIC_TABLES.find((item) => item.name === "canonical_exercises");
    const user = table?.permissions.find((p) => p.role === "user");
    const admin = table?.permissions.find((p) => p.role === "admin");
    expect(user?.operations.select).toBeDefined();
    expect(user?.operations.insert).toBeUndefined();
    expect(admin?.operations.insert).toBeDefined();
    expect(admin?.operations.update).toBeDefined();
  });

  it("audit_logs só super_admin lê; user não", () => {
    const table = PUBLIC_TABLES.find((item) => item.name === "audit_logs");
    expect(table?.permissions.some((p) => p.role === "user")).toBe(false);
    expect(table?.permissions.some((p) => p.role === "admin")).toBe(false);
    expect(
      table?.permissions.find((p) => p.role === "super_admin")?.operations.select,
    ).toBeDefined();
    expect(
      table?.permissions.find((p) => p.role === "super_admin")?.operations.insert,
    ).toBeDefined();
  });

  it("admin grava academia e inventário; super_admin cria contrato e ai_runs", () => {
    const gyms = PUBLIC_TABLES.find((item) => item.name === "gyms");
    expect(gyms?.permissions.find((p) => p.role === "admin")?.operations.insert).toBeDefined();
    const plates = PUBLIC_TABLES.find((item) => item.name === "gym_plates");
    expect(plates?.permissions.find((p) => p.role === "admin")?.operations.insert).toBeDefined();
    const contracts = PUBLIC_TABLES.find((item) => item.name === "ai_contracts");
    expect(
      contracts?.permissions.find((p) => p.role === "super_admin")?.operations.insert,
    ).toBeDefined();
    expect(
      contracts?.permissions.find((p) => p.role === "admin")?.operations.insert,
    ).toBeUndefined();
    const runs = PUBLIC_TABLES.find((item) => item.name === "ai_runs");
    expect(
      runs?.permissions.find((p) => p.role === "super_admin")?.operations.insert,
    ).toBeDefined();
  });

  it("user não publica contrato de IA", () => {
    const table = PUBLIC_TABLES.find((item) => item.name === "ai_contract_versions");
    const user = table?.permissions.find((p) => p.role === "user");
    expect(user?.operations.insert).toBeUndefined();
    expect(user?.operations.update).toBeUndefined();
    expect(user?.operations.select?.filter).toEqual({ state: { _eq: "published" } });
  });

  it("toda tabela atleta isola user por X-Hasura-User-Id", () => {
    const athleteTables = PUBLIC_TABLES.filter((table) => table.kind === "athlete");
    for (const table of athleteTables) {
      const user = table.permissions.find((p) => p.role === "user");
      expect(user?.operations.select, table.name).toBeDefined();
      const serialized = JSON.stringify(user?.operations.select?.filter);
      expect(serialized, table.name).toContain("X-Hasura-User-Id");
    }
  });

  it("auth.user_roles não tem insert GraphQL (admin só via SQL)", () => {
    const yaml = readFileSync(
      "nhost/metadata/databases/default/tables/auth_user_roles.yaml",
      "utf8",
    );
    expect(yaml).not.toMatch(/insert_permissions/);
  });

  it("insert de user com user_id usa preset de sessão, exceto memberships de academia", () => {
    for (const table of PUBLIC_TABLES) {
      const user = table.permissions.find((p) => p.role === "user");
      const insert = user?.operations.insert;
      if (!insert?.columns?.includes("user_id")) continue;
      // Dono da academia insere linhas de outros atletas; não forçar user_id da sessão.
      if (table.name === "gym_memberships") {
        expect(insert.set?.user_id, table.name).toBeUndefined();
        continue;
      }
      expect(insert.set?.user_id, table.name).toBe("x-hasura-user-id");
    }
  });

  it("nhost.toml define acesso atleta e administrador", () => {
    const toml = readFileSync("nhost/nhost.toml", "utf8");
    expect(toml).toContain("default = 'user'");
    expect(toml).toContain("allowed = ['user', 'me', 'admin', 'super_admin']");
    expect(toml).toContain("emailVerificationRequired = false");
  });

  it("migration registra papéis admin e super_admin em auth.roles", () => {
    const sql = readFileSync("nhost/migrations/default/20260826134500_tervelo_core/up.sql", "utf8");
    expect(sql).toContain("INSERT INTO auth.roles");
    expect(sql).toContain("'admin'");
    expect(sql).toContain("'super_admin'");
  });
});
