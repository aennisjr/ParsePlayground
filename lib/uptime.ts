/**
 * Uptime history recorded by .github/workflows/uptime.yml, which commits
 * status.json to the `status` branch. It's read from the raw file, so no
 * database or platform service is involved. Set UPTIME_DATA_URL to point a
 * fork at its own repository.
 */
export const UPTIME_DATA_URL =
  process.env.UPTIME_DATA_URL ?? "https://raw.githubusercontent.com/aennisjr/ParsePlayground/status/status.json";

export type Check = { time: string; status: number; ms: number; ok: boolean };

export type DaySummary = { date: string; checks: number; failures: number; uptime: number | null };

export type UptimeSummary = {
  checks: Check[];
  latest: Check | null;
  uptime: { label: string; hours: number; checks: number; pct: number | null }[];
  avgMs: number | null;
  p95Ms: number | null;
  days: DaySummary[];
};

export async function loadChecks(): Promise<Check[] | null> {
  try {
    const res = await fetch(UPTIME_DATA_URL, { next: { revalidate: 300 }, signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (!Array.isArray(data)) return null;
    return data.filter((c): c is Check => typeof c?.time === "string" && typeof c?.ok === "boolean");
  } catch {
    return null;
  }
}

const pct = (ok: number, n: number) => (n ? (ok / n) * 100 : null);

export function summarise(checks: Check[], now = Date.now(), dayCount = 30): UptimeSummary {
  const sorted = [...checks].sort((a, b) => a.time.localeCompare(b.time));
  const since = (hours: number) => sorted.filter((c) => now - Date.parse(c.time) <= hours * 3_600_000);

  const uptime = [
    { label: "24 hours", hours: 24 },
    { label: "7 days", hours: 24 * 7 },
    { label: "30 days", hours: 24 * 30 },
  ].map((w) => {
    const inWindow = since(w.hours);
    return { ...w, checks: inWindow.length, pct: pct(inWindow.filter((c) => c.ok).length, inWindow.length) };
  });

  const okTimes = since(24).filter((c) => c.ok).map((c) => c.ms).sort((a, b) => a - b);
  const avgMs = okTimes.length ? Math.round(okTimes.reduce((s, x) => s + x, 0) / okTimes.length) : null;
  const p95Ms = okTimes.length ? okTimes[Math.min(okTimes.length - 1, Math.ceil(okTimes.length * 0.95) - 1)] : null;

  const byDay = new Map<string, Check[]>();
  for (const c of sorted) {
    const d = c.time.slice(0, 10);
    byDay.set(d, [...(byDay.get(d) ?? []), c]);
  }
  const days: DaySummary[] = [];
  for (let i = dayCount - 1; i >= 0; i--) {
    const date = new Date(now - i * 86_400_000).toISOString().slice(0, 10);
    const list = byDay.get(date) ?? [];
    const failures = list.filter((c) => !c.ok).length;
    days.push({ date, checks: list.length, failures, uptime: pct(list.length - failures, list.length) });
  }

  return { checks: sorted, latest: sorted.at(-1) ?? null, uptime, avgMs, p95Ms, days };
}
