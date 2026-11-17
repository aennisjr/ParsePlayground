import { collectionRoute } from "@/lib/collection-route";
import { DATASETS, type Property } from "@/lib/data";

/** GET /api/real-estate — ?q= &listingType=sale|rent &propertyType= &city= &min_beds= &min_price= &max_price= &sort=price|-price|areaSqm|listedAt. */
export const GET = collectionRoute(DATASETS["real-estate"] as (Property & Record<string, unknown>)[], {
  root: "properties",
  item: "property",
  searchFields: ["title", "propertyType", "agent", "city", "description"],
  filterFields: ["listingType", "propertyType", "city", "country", "currency"],
  ranges: [
    { field: "price", min: "min_price", max: "max_price" },
    { field: "bedrooms", min: "min_beds" },
  ],
  sortFields: ["price", "areaSqm", "bedrooms", "listedAt"],
});
