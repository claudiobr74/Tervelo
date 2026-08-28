import { NextResponse } from "next/server";
import { z } from "zod";
import {
  disconnectedOrFail,
  graphqlFailure,
  requireAdminContext,
} from "@/lib/admin/require-session";
import { ADMIN_QUERIES } from "@/lib/admin/queries";
import { runGraphqlAsUser } from "@/lib/nhost/graphql-server";

export async function GET(request: Request) {
  const gate = await requireAdminContext();
  if (!gate.ok) return gate.response;
  const gymId = new URL(request.url).searchParams.get("gymId");
  if (!gymId || !z.string().uuid().safeParse(gymId).success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }
  const result = await runGraphqlAsUser(
    gate.context.session,
    ADMIN_QUERIES.inventory,
    { gymId },
    "admin",
  );
  if (!result.ok) {
    return disconnectedOrFail(result, {
      gyms: [],
      gym_plates: [],
      gym_bars: [],
      gym_dumbbell_sets: [],
      gym_equipment: [],
      equipment: [],
    })!;
  }
  return NextResponse.json({ ok: true, data: result.data });
}

const plateSchema = z.object({
  gymId: z.string().uuid(),
  plateId: z.string().uuid().optional(),
  weightKg: z.number().positive().max(100),
  quantity: z.number().int().min(0).max(200),
});

const barSchema = z.object({
  gymId: z.string().uuid(),
  name: z.string().trim().min(2).max(80),
  actualWeightKg: z.number().positive().max(50),
  barKind: z.string().trim().min(1).max(40),
});

export async function POST(request: Request) {
  const gate = await requireAdminContext();
  if (!gate.ok) return gate.response;
  const body = (await request.json().catch(() => null)) as { kind?: string } | null;
  if (body?.kind === "bar") {
    const parsed = barSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
    }
    const result = await runGraphqlAsUser(
      gate.context.session,
      ADMIN_QUERIES.insertBar,
      {
        gym_id: parsed.data.gymId,
        name: parsed.data.name,
        actual_weight_kg: parsed.data.actualWeightKg,
        bar_kind: parsed.data.barKind,
      },
      "admin",
    );
    if (!result.ok) return graphqlFailure(result.reason);
    return NextResponse.json({ ok: true, data: result.data });
  }
  const parsed = plateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }
  if (parsed.data.plateId) {
    const result = await runGraphqlAsUser(
      gate.context.session,
      ADMIN_QUERIES.updatePlate,
      { id: parsed.data.plateId, quantity: parsed.data.quantity },
      "admin",
    );
    if (!result.ok) return graphqlFailure(result.reason);
    return NextResponse.json({ ok: true, data: result.data });
  }
  const result = await runGraphqlAsUser(
    gate.context.session,
    ADMIN_QUERIES.insertPlate,
    {
      gym_id: parsed.data.gymId,
      weight_kg: parsed.data.weightKg,
      quantity: parsed.data.quantity,
    },
    "admin",
  );
  if (!result.ok) return graphqlFailure(result.reason);
  return NextResponse.json({ ok: true, data: result.data });
}
