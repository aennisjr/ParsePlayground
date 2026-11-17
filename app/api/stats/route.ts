import { NextResponse } from "next/server";
import { getStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

/** GET /api/stats — in-memory request statistics for this serverless instance. */
export function GET() {
  return NextResponse.json(getStats(), { headers: { "Cache-Control": "no-store" } });
}
