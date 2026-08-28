import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAthleteSession } from "@/lib/athlete/require-session";
import { disconnectedOrFail, graphqlFailure } from "@/lib/admin/require-session";
import { runGraphqlAsUser } from "@/lib/nhost/graphql-server";

const GET_QUERY = `
  query AthletePreferences {
    profiles(limit: 1) {
      id display_name locale shortcuts_enabled theme_preference
    }
  }
`;

const UPDATE_PREFERENCES = `
  mutation AthleteUpdatePreferences($shortcuts_enabled: Boolean!) {
    update_profiles(where: {}, _set: { shortcuts_enabled: $shortcuts_enabled }) { affected_rows }
  }
`;

export async function GET() {
  const gate = await requireAthleteSession();
  if (!gate.ok) return gate.response;
  const result = await runGraphqlAsUser<{
    profiles: {
      id: string;
      display_name: string;
      locale: string;
      shortcuts_enabled: boolean;
      theme_preference: string;
    }[];
  }>(gate.session, GET_QUERY, {});
  if (!result.ok) {
    return disconnectedOrFail(result, {
      displayName: gate.session.user?.displayName ?? "",
      locale: "pt",
      shortcutsEnabled: false,
      themePreference: "system",
    })!;
  }
  const row = result.data.profiles[0];
  return NextResponse.json({
    ok: true,
    data: {
      displayName: row?.display_name ?? gate.session.user?.displayName ?? "",
      locale: row?.locale ?? "pt",
      shortcutsEnabled: row?.shortcuts_enabled ?? false,
      themePreference: row?.theme_preference ?? "system",
    },
  });
}

const patchSchema = z.object({ shortcutsEnabled: z.boolean() });

export async function PATCH(request: Request) {
  const gate = await requireAthleteSession();
  if (!gate.ok) return gate.response;
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }
  const result = await runGraphqlAsUser(gate.session, UPDATE_PREFERENCES, {
    shortcuts_enabled: parsed.data.shortcutsEnabled,
  });
  if (!result.ok) return graphqlFailure(result.reason);
  return NextResponse.json({ ok: true, data: parsed.data });
}
