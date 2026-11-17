/**
 * Shared helpers for the public data API: content negotiation (JSON / XML /
 * CSV), the three pagination styles (page, offset, cursor), and list queries.
 */
import { NextRequest, NextResponse } from "next/server";
import { toCsv, xmlNode } from "@/lib/serialize";

export type Format = "json" | "xml" | "csv";

export function negotiateFormat(req: NextRequest): Format {
  const q = req.nextUrl.searchParams.get("format")?.toLowerCase();
  if (q === "xml" || q === "csv" || q === "json") return q;
  const accept = req.headers.get("accept") ?? "";
  if (/application\/xml|text\/xml/.test(accept)) return "xml";
  if (/text\/csv/.test(accept)) return "csv";
  return "json";
}

export function respond(
  req: NextRequest,
  body: { data: unknown; meta?: Record<string, unknown>; links?: Record<string, string | null> },
  opts: { root: string; item: string; status?: number; headers?: HeadersInit } = { root: "response", item: "item" },
) {
  const format = negotiateFormat(req);
  const headers = new Headers(opts.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Cache-Control", "public, max-age=60");
  headers.set("Vary", "Accept");
  // Netlify's CDN ignores the query string in its cache key unless told
  // otherwise, which made ?offset=, ?cursor=, filters and ?format= all return
  // the first cached response. Other hosts ignore this header.
  headers.set("Netlify-Vary", "query,header=Accept");
  const status = opts.status ?? 200;

  if (format === "csv") {
    const rows = (Array.isArray(body.data) ? body.data : [body.data]) as Record<string, unknown>[];
    headers.set("Content-Type", "text/csv; charset=utf-8");
    return new NextResponse(toCsv(rows), { status, headers });
  }
  if (format === "xml") {
    const inner = Array.isArray(body.data)
      ? body.data.map((d) => xmlNode(opts.item, d)).join("")
      : xmlNode(opts.item, body.data);
    const meta = body.meta ? xmlNode("meta", body.meta) : "";
    const links = body.links ? xmlNode("links", body.links) : "";
    headers.set("Content-Type", "application/xml; charset=utf-8");
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>\n<${opts.root}>${meta}${links}<data>${inner}</data></${opts.root}>\n`,
      { status, headers },
    );
  }
  return NextResponse.json(body, { status, headers });
}

export const encodeCursor = (offset: number) => Buffer.from(`o:${offset}`).toString("base64url");
export function decodeCursor(cursor: string): number | null {
  const m = /^o:(\d+)$/.exec(Buffer.from(cursor, "base64url").toString());
  return m ? Number(m[1]) : null;
}

/**
 * Applies ?q, filters, ?sort, then one of three pagination styles:
 *   ?page=2&per_page=20       (page-based)
 *   ?offset=40&limit=20       (offset-based)
 *   ?cursor=<opaque>&limit=20 (cursor-based)
 */
export type ListConfig<T> = {
  searchFields: (keyof T)[];
  /** Exact-match filters; the query parameter has the same name as the field. */
  filterFields: (keyof T)[];
  sortFields: (keyof T)[];
  /** Numeric range filters. Defaults to min_price / max_price on `price` when the rows have one. */
  ranges?: { field: keyof T; min?: string; max?: string }[];
  /** Filters where the row's array field must contain the value, e.g. ?tag=python on `tags`. */
  containsFilters?: { param: string; field: keyof T }[];
  defaultLimit?: number;
};

export function listQuery<T extends Record<string, unknown>>(url: URL, rows: T[], cfg: ListConfig<T>) {
  const sp = url.searchParams;
  let result = rows;

  const q = sp.get("q")?.trim().toLowerCase();
  if (q) result = result.filter((r) => cfg.searchFields.some((f) => String(r[f] ?? "").toLowerCase().includes(q)));

  for (const f of cfg.filterFields) {
    const v = sp.get(String(f));
    if (v !== null) result = result.filter((r) => String(r[f]).toLowerCase() === v.toLowerCase());
  }
  const ranges = cfg.ranges ?? ("price" in (rows[0] ?? {}) ? [{ field: "price" as keyof T, min: "min_price", max: "max_price" }] : []);
  for (const { field, min, max } of ranges) {
    const lo = min ? sp.get(min) : null;
    const hi = max ? sp.get(max) : null;
    if (lo && !Number.isNaN(Number(lo))) result = result.filter((r) => Number(r[field]) >= Number(lo));
    if (hi && !Number.isNaN(Number(hi))) result = result.filter((r) => Number(r[field]) <= Number(hi));
  }
  for (const { param, field } of cfg.containsFilters ?? []) {
    const v = sp.get(param)?.toLowerCase();
    if (v) result = result.filter((r) => Array.isArray(r[field]) && (r[field] as unknown[]).some((x) => String(x).toLowerCase() === v));
  }

  const sort = sp.get("sort");
  if (sort) {
    const desc = sort.startsWith("-");
    const key = (desc ? sort.slice(1) : sort) as keyof T;
    if (cfg.sortFields.includes(key)) {
      result = [...result].sort((a, b) => {
        const av = a[key] as never, bv = b[key] as never;
        // Nulls always sort last, whichever direction is requested.
        if (av == null || bv == null) return av == bv ? 0 : av == null ? 1 : -1;
        const cmp = av === bv ? 0 : av > bv ? 1 : -1;
        return desc ? -cmp : cmp;
      });
    }
  }

  const total = result.length;
  const limit = Math.min(100, Math.max(1, Number(sp.get("limit") ?? sp.get("per_page") ?? cfg.defaultLimit ?? 20) || (cfg.defaultLimit ?? 20)));
  let offset = 0;
  let mode: "page" | "offset" | "cursor" = "page";
  if (sp.has("cursor")) {
    // An empty ?cursor= starts cursor pagination from the beginning.
    mode = "cursor";
    const cursor = sp.get("cursor");
    offset = cursor ? decodeCursor(cursor) ?? 0 : 0;
  } else if (sp.has("offset")) {
    mode = "offset";
    offset = Math.max(0, Number(sp.get("offset")) || 0);
  } else {
    offset = (Math.max(1, Number(sp.get("page") ?? 1) || 1) - 1) * limit;
  }

  const data = result.slice(offset, offset + limit);
  const hasMore = offset + limit < total;
  const link = (patch: Record<string, string | null>) => {
    const u = new URL(url);
    for (const [k, v] of Object.entries(patch)) (v === null ? u.searchParams.delete(k) : u.searchParams.set(k, v));
    return u.pathname + u.search;
  };

  const meta: Record<string, unknown> = { total, limit, offset, pagination: mode };
  const links: Record<string, string | null> = {};
  if (mode === "cursor") {
    meta.nextCursor = hasMore ? encodeCursor(offset + limit) : null;
    links.next = hasMore ? link({ cursor: encodeCursor(offset + limit) }) : null;
  } else if (mode === "offset") {
    links.next = hasMore ? link({ offset: String(offset + limit) }) : null;
    links.prev = offset > 0 ? link({ offset: String(Math.max(0, offset - limit)) }) : null;
  } else {
    const page = Math.floor(offset / limit) + 1;
    meta.page = page;
    meta.totalPages = Math.max(1, Math.ceil(total / limit));
    links.next = hasMore ? link({ page: String(page + 1) }) : null;
    links.prev = page > 1 ? link({ page: String(page - 1) }) : null;
  }
  return { data, meta, links };
}
