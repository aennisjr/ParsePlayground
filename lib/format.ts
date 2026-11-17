export function formatMoney(amount: number, currency = "USD") {
  return amount.toLocaleString("en-US", { style: "currency", currency, minimumFractionDigits: amount % 1 ? 2 : 0 });
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

/** Builds "?a=1&b=2" from a params object, dropping empty values. */
export function buildQuery(params: Record<string, string | undefined>, patch: Record<string, string | undefined> = {}) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...params, ...patch })) if (v) sp.set(k, v);
  const s = sp.toString();
  return s ? `?${s}` : "";
}

/** Next.js searchParams can contain arrays; keep the first value of each and drop empties. */
export function cleanParams(sp: Record<string, string | string[] | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    const val = Array.isArray(v) ? v[0] : v;
    if (val !== undefined && val.trim() !== "") out[k] = val.trim();
  }
  return out;
}
