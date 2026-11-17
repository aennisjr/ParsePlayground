import { itemRoute } from "@/lib/item-route";
import { DATASETS } from "@/lib/data";

/** GET /api/jobs/{id} */
export const GET = itemRoute(DATASETS.jobs, { path: "/api/jobs", item: "job" });
