import type { NextRequest } from "next/server";
import { listQuery, respond, type ListConfig } from "./api";
import { recordRequest } from "./stats";

/** Builds a GET handler for a list endpoint over a static dataset. */
export function collectionRoute<T extends Record<string, unknown>>(
  rows: T[],
  cfg: ListConfig<T> & {
    root: string;
    item: string;
    /** Strip heavy fields from list responses. */
    summarize?: (row: T) => Record<string, unknown>;
  },
) {
  return async function GET(req: NextRequest) {
    recordRequest(req.nextUrl.pathname);
    // Optional artificial latency (?delay=800, max 5000 ms) for practising waits.
    const delay = Math.min(5000, Math.max(0, Number(req.nextUrl.searchParams.get("delay")) || 0));
    if (delay) await new Promise((r) => setTimeout(r, delay));
    const { data, meta, links } = listQuery(req.nextUrl, rows, cfg);
    return respond(req, { data: cfg.summarize ? data.map(cfg.summarize) : data, meta, links }, cfg);
  };
}
