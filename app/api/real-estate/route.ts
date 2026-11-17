import { collectionRoute } from "@/lib/collection-route";
import { DATASETS, type Property } from "@/lib/data";

/** GET /api/real-estate — ?q= &listingType=sale|rent &propertyType= &bedrooms= &min_price= &max_price= &sort=price|-price|areaSqm|listedAt. */
export const GET = collectionRoute(DATASETS["real-estate"] as (Property & Record<string, unknown>)[], {
  root: "properties",
  item: "property",
  searchFields: ["title", "propertyType", "agent"],
  filterFields: ["listingType", "propertyType", "bedrooms", "currency"],
  sortFields: ["price", "areaSqm", "bedrooms", "listedAt"],
});
