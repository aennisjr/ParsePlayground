import type { NextRequest } from "next/server";
import { respond } from "./api";
import { recordRequest } from "./stats";

/** Builds a GET handler for /api/<collection>/{id} over a static dataset. */
export function itemRoute<T extends { id: number }>(rows: T[], cfg: { path: string; item: string }) {
  return async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    recordRequest(`${cfg.path}/[id]`);
    const { id } = await ctx.params;
    const row = /^\d+$/.test(id) ? rows.find((r) => r.id === Number(id)) : undefined;
    if (!row) {
      return respond(req, { data: { error: "not_found", message: `No ${cfg.item} with id ${id}` } }, { root: "error", item: "error", status: 404 });
    }
    return respond(req, { data: row }, { root: "response", item: cfg.item });
  };
}
