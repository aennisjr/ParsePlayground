import { NextResponse, type NextRequest } from "next/server";
import { checkRateLimit, clientIp, RATE_LIMITS, recordRequest, type RateTier } from "@/lib/stats";

export const dynamic = "force-dynamic";

/**
 * GET /api/rate-limit/none | mild | strict
 * Demonstrates rate-limit headers. mild = 60/min, strict = 5/min, per client IP.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ tier: string }> }) {
  const { tier } = await ctx.params;
  if (!(tier in RATE_LIMITS)) {
    return NextResponse.json({ error: "unknown_tier", tiers: Object.keys(RATE_LIMITS) }, { status: 404 });
  }
  recordRequest(`/api/rate-limit/${tier}`);
  const { allowed, headers } = checkRateLimit(tier as RateTier, clientIp(req.headers));
  const h = { ...headers, "Cache-Control": "no-store" };
  if (!allowed) {
    return NextResponse.json(
      { error: "rate_limited", message: "Too many requests. Wait for the number of seconds in Retry-After." },
      { status: 429, headers: h },
    );
  }
  return NextResponse.json({ ok: true, tier, time: new Date().toISOString() }, { headers: h });
}
