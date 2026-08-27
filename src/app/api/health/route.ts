import { healthPayload } from "@/lib/observability/health";

export function GET() {
  return Response.json(healthPayload());
}
