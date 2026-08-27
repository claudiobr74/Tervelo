import { describe, expect, it } from "vitest";
import { athleteProfileInput } from "@/domain/athlete/onboarding-profile";
import { persistOnboardingToNhost, type GraphqlRunner } from "@/lib/auth/onboarding-persist";
import type { StoredAppSession } from "@/lib/auth/session-cookie";
import type { GraphqlOutcome } from "@/lib/nhost/graphql-server";

const SESSION: StoredAppSession = {
  accessToken: "nhost-access-token",
  user: { id: "11111111-1111-4111-8111-111111111111", displayName: "Lucas" },
};

const INPUT = athleteProfileInput({
  displayName: "Lucas",
  sex: "male",
  birthDate: "1994-03-12",
  heightCm: "180",
  weightKg: "82",
  chestCm: "104",
  waistCm: "84",
  experience: "6m-2y",
  goal: "hypertrophy",
  days: ["seg", "qua"],
  sessionMinutes: 75,
  mealsPerDay: 4,
  dietPattern: "Vegetariana",
  waterLiters: 3,
  limitations: "Ombro",
});

function mutationName(query: string): string {
  return query.match(/mutation\s+(\w+)/)?.[1] ?? "";
}

function graphqlStub(
  handlers: Record<string, (variables: Record<string, unknown>) => GraphqlOutcome<unknown>>,
): { runner: GraphqlRunner; calls: string[] } {
  const calls: string[] = [];
  const runner: GraphqlRunner = async (_session, query, variables) => {
    const name = mutationName(query);
    calls.push(name);
    const handler = handlers[name];
    if (!handler) {
      return { ok: true, data: { result: { affected_rows: 1 } } } as never;
    }
    return handler(variables) as never;
  };
  return { runner, calls };
}

describe("persistOnboardingToNhost", () => {
  it("não fala com o Hasura em sessão de pré-visualização", async () => {
    const { runner, calls } = graphqlStub({});
    const result = await persistOnboardingToNhost(
      { ...SESSION, preview: true, accessToken: "preview" },
      INPUT,
      runner,
    );
    expect(result).toEqual({ persisted: false });
    expect(calls).toEqual([]);
  });

  it("atualiza o perfil existente em vez de inserir de novo", async () => {
    const { runner, calls } = graphqlStub({
      UpdateAthleteProfile: () => ({
        ok: true,
        data: { update_athlete_profiles: { affected_rows: 1 } },
      }),
    });
    const result = await persistOnboardingToNhost(SESSION, INPUT, runner);
    expect(result).toEqual({ persisted: true });
    expect(calls[0]).toBe("UpdateAthleteProfile");
    expect(calls).not.toContain("InsertAthleteProfile");
    expect(calls).toContain("UpdateDisplayName");
    expect(calls).toContain("UpdateNutritionProfile");
    expect(calls).toContain("InsertAthleteGoal");
    expect(calls).toContain("InsertOnboardingMeasurement");
    expect(calls).toContain("InsertOnboardingLimitation");
  });

  it("insere o perfil só se o update não achou linha", async () => {
    const { runner, calls } = graphqlStub({
      UpdateAthleteProfile: () => ({
        ok: true,
        data: { update_athlete_profiles: { affected_rows: 0 } },
      }),
      InsertAthleteProfile: () => ({
        ok: true,
        data: { insert_athlete_profiles_one: { id: "1" } },
      }),
    });
    const result = await persistOnboardingToNhost(SESSION, INPUT, runner);
    expect(result).toEqual({ persisted: true });
    expect(calls.slice(0, 2)).toEqual(["UpdateAthleteProfile", "InsertAthleteProfile"]);
  });

  it("não derruba o cadastro quando o GraphQL falha: persisted false", async () => {
    const { runner, calls } = graphqlStub({
      UpdateAthleteProfile: () => ({ ok: false, reason: "graphql_error" }),
    });
    const result = await persistOnboardingToNhost(SESSION, INPUT, runner);
    expect(result).toEqual({ persisted: false });
    expect(calls[0]).toBe("UpdateAthleteProfile");
    expect(calls).not.toContain("InsertAthleteProfile");
  });

  it("cria nutrição quando ainda não existe linha", async () => {
    const { runner, calls } = graphqlStub({
      UpdateAthleteProfile: () => ({
        ok: true,
        data: { update_athlete_profiles: { affected_rows: 1 } },
      }),
      UpdateNutritionProfile: () => ({
        ok: true,
        data: { update_nutrition_profiles: { affected_rows: 0 } },
      }),
    });
    await persistOnboardingToNhost(SESSION, INPUT, runner);
    expect(calls).toContain("InsertNutritionProfile");
  });
});
