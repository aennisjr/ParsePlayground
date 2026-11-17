/**
 * In-memory request statistics and rate limiting.
 *
 * There is deliberately no database. On serverless hosts each function
 * instance has its own memory, so these numbers are per instance and reset
 * when the instance is recycled. The API responses say so explicitly.
 */
const startedAt = new Date().toISOString();
const counts = new Map<string, number>();
let total = 0;

export function recordRequest(path: string) {
  total++;
  counts.set(path, (counts.get(path) ?? 0) + 1);
}

export function getStats() {
  return {
    scope: "this-instance",
    note: "Counts are held in memory per serverless instance and reset when the instance restarts.",
    instanceStartedAt: startedAt,
    totalRequests: total,
    byPath: Object.fromEntries([...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 50)),
  };
}

export const RATE_LIMITS = {
  none: null,
  mild: { limit: 60, windowSeconds: 60 },
  strict: { limit: 5, windowSeconds: 60 },
} as const;
export type RateTier = keyof typeof RATE_LIMITS;

const windows = new Map<string, { start: number; count: number }>();

/** Fixed-window limiter keyed by tier + client IP. */
export function checkRateLimit(tier: RateTier, clientKey: string) {
  const cfg = RATE_LIMITS[tier];
  if (!cfg) return { allowed: true, headers: { "X-RateLimit-Policy": "none" } as Record<string, string> };

  const now = Date.now();
  const key = `${tier}:${clientKey}`;
  let w = windows.get(key);
  if (!w || now - w.start >= cfg.windowSeconds * 1000) {
    w = { start: now, count: 0 };
    windows.set(key, w);
  }
  w.count++;
  const resetSeconds = Math.ceil((w.start + cfg.windowSeconds * 1000 - now) / 1000);
  const remaining = Math.max(0, cfg.limit - w.count);
  const headers: Record<string, string> = {
    "X-RateLimit-Policy": `${cfg.limit};w=${cfg.windowSeconds}`,
    "X-RateLimit-Limit": String(cfg.limit),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(resetSeconds),
    "X-RateLimit-Scope": "per-instance",
  };
  const allowed = w.count <= cfg.limit;
  if (!allowed) headers["Retry-After"] = String(resetSeconds);

  // keep the map from growing forever
  if (windows.size > 10_000) for (const [k, v] of windows) if (now - v.start > 120_000) windows.delete(k);
  return { allowed, headers };
}

export function clientIp(headers: Headers): string {
  return (
    headers.get("x-nf-client-connection-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}
