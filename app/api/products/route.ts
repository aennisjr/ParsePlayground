import { collectionRoute } from "@/lib/collection-route";
import { DATASETS, type Product } from "@/lib/data";

/**
 * GET /api/products
 * ?q= &category= &brand= &inStock= &min_price= &max_price= &sort=price|-price|rating|name|createdAt
 * Pagination: ?page=&per_page=  |  ?offset=&limit=  |  ?cursor=&limit=
 * Format: ?format=json|xml|csv or Accept header
 */
export const GET = collectionRoute(DATASETS.products as (Product & Record<string, unknown>)[], {
  root: "products",
  item: "product",
  searchFields: ["name", "brand", "category", "description"],
  filterFields: ["category", "brand", "inStock"],
  sortFields: ["price", "rating", "name", "createdAt", "inventory"],
  summarize: ({ reviews: _reviews, ...rest }) => rest,
});
