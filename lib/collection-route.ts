import type { NextRequest } from "next/server";
import { listQuery, respond } from "./api";
import { recordRequest } from "./stats";

/** Builds a GET handler for a list endpoint over a static dataset. */
export function collectionRoute<T extends Record<string, unknown>>(
  rows: T[],
  cfg: {
    root: string;
    item: string;
    searchFields: (keyof T)[];
    filterFields: (keyof T)[];
    sortFields: (keyof T)[];
    /** Strip heavy fields from list responses. */
    summarize?: (row: T) => Record<string, unknown>;
  },
) {
  return function GET(req: NextRequest) {
    recordRequest(req.nextUrl.pathname);
    const { data, meta, links } = listQuery(req, rows, cfg);
    return respond(req, { data: cfg.summarize ? data.map(cfg.summarize) : data, meta, links }, cfg);
  };
}
