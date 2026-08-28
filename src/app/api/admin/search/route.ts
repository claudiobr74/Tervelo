import { NextResponse } from "next/server";
import { disconnectedOrFail, requireAdminContext } from "@/lib/admin/require-session";
import { ADMIN_QUERIES } from "@/lib/admin/queries";
import { runGraphqlAsUser } from "@/lib/nhost/graphql-server";

export async function GET(request: Request) {
  const gate = await requireAdminContext();
  if (!gate.ok) return gate.response;
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  const result = await runGraphqlAsUser<{
    profiles: { id: string; display_name: string }[];
    canonical_exercises: { id: string; name_pt: string }[];
  }>(gate.context.session, ADMIN_QUERIES.search, {}, "admin");
  if (!result.ok) return disconnectedOrFail(result, { users: [], exercises: [], query: q })!;
  const needle = q.toLocaleLowerCase("pt-BR");
  const users = result.data.profiles
    .filter((row) => !needle || row.display_name.toLocaleLowerCase("pt-BR").includes(needle))
    .slice(0, 8)
    .map((row) => ({
      id: row.id,
      label: row.display_name || row.id.slice(0, 8),
      href: "/admin/users",
    }));
  const exercises = result.data.canonical_exercises
    .filter((row) => !needle || row.name_pt.toLocaleLowerCase("pt-BR").includes(needle))
    .slice(0, 8)
    .map((row) => ({ id: row.id, label: row.name_pt, href: "/admin/exercises" }));
  return NextResponse.json({ ok: true, data: { users, exercises, query: q } });
}
