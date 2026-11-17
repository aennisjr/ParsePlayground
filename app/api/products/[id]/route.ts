import type { NextRequest } from "next/server";
import { respond } from "@/lib/api";
import { getProduct } from "@/lib/data";
import { recordRequest } from "@/lib/stats";

/** GET /api/products/{id} — full product including reviews. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  recordRequest("/api/products/[id]");
  const { id } = await ctx.params;
  const product = /^\d+$/.test(id) ? getProduct(Number(id)) : undefined;
  if (!product) {
    return respond(req, { data: { error: "not_found", message: `No product with id ${id}` } }, { root: "error", item: "error", status: 404 });
  }
  return respond(req, { data: product }, { root: "response", item: "product" });
}
