import { itemRoute } from "@/lib/item-route";
import { DATASETS } from "@/lib/data";

/** GET /api/blog/{id} — full post including sections. */
export const GET = itemRoute(DATASETS.blog, { path: "/api/blog", item: "post" });
