import { NextResponse } from "next/server";
import { z } from "zod";
import {
  disconnectedOrFail,
  graphqlFailure,
  requireAdminContext,
} from "@/lib/admin/require-session";
import { ADMIN_QUERIES } from "@/lib/admin/queries";
import { runGraphqlAsUser } from "@/lib/nhost/graphql-server";

export async function GET() {
  const gate = await requireAdminContext();
  if (!gate.ok) return gate.response;
  const result = await runGraphqlAsUser(gate.context.session, ADMIN_QUERIES.equipment, {}, "admin");
  if (!result.ok) return disconnectedOrFail(result, { equipment: [], equipment_categories: [] })!;
  return NextResponse.json({ ok: true, data: result.data });
}

const insertSchema = z.object({
  namePt: z.string().trim().min(2).max(120),
  categoryId: z.string().uuid().optional(),
  resistanceSystem: z.string().trim().max(80).optional(),
});

export async function POST(request: Request) {
  const gate = await requireAdminContext();
  if (!gate.ok) return gate.response;
  const parsed = insertSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }
  const result = await runGraphqlAsUser(
    gate.context.session,
    ADMIN_QUERIES.insertEquipment,
    {
      name_pt: parsed.data.namePt,
      category_id: parsed.data.categoryId ?? null,
      resistance_system: parsed.data.resistanceSystem ?? null,
    },
    "admin",
  );
  if (!result.ok) return graphqlFailure(result.reason);
  return NextResponse.json({ ok: true, data: result.data });
}
