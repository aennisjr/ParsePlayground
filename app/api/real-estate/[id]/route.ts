import { itemRoute } from "@/lib/item-route";
import { DATASETS } from "@/lib/data";

/** GET /api/real-estate/{id} */
export const GET = itemRoute(DATASETS["real-estate"], { path: "/api/real-estate", item: "property" });
