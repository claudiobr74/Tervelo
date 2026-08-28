import { NextResponse } from "next/server";
import { graphqlFailure, requireAdminContext } from "@/lib/admin/require-session";
import { ADMIN_QUERIES } from "@/lib/admin/queries";
import { runGraphqlAsUser } from "@/lib/nhost/graphql-server";

export async function GET() {
  const gate = await requireAdminContext();
  if (!gate.ok) return gate.response;
  const { session, superAdmin, userId } = gate.context;
  let displayName = session.user?.displayName ?? "Administrador";
  if (userId) {
    const profile = await runGraphqlAsUser<{
      profiles: { id: string; display_name: string; locale: string }[];
    }>(session, ADMIN_QUERIES.profile, { id: userId }, "admin");
    if (profile.ok && profile.data.profiles[0]?.display_name) {
      displayName = profile.data.profiles[0].display_name;
    } else if (!profile.ok && profile.reason !== "nhost_unavailable") {
      return graphqlFailure(profile.reason);
    }
  }
  return NextResponse.json({
    ok: true,
    data: {
      displayName,
      email: session.user?.email ?? null,
      superAdmin,
      connected: Boolean(
        session.accessToken && session.accessToken !== "preview" && !session.preview,
      ),
    },
  });
}
