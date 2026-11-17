import { NextResponse } from "next/server";
import { DATASETS } from "@/lib/data";

export const dynamic = "force-dynamic";

/** GET /api/health — used by the uptime workflow and the status page. */
export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      time: new Date().toISOString(),
      commit: process.env.COMMIT_REF ?? null,
      datasets: Object.fromEntries(Object.entries(DATASETS).map(([k, v]) => [k, v.length])),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
