import { collectionRoute } from "@/lib/collection-route";
import { DATASETS } from "@/lib/data";

const REVIEWS = DATASETS.products.flatMap((p) =>
  p.reviews.map((r) => ({ ...r, productId: p.id, productName: p.name, productSlug: p.slug, productSku: p.sku })),
);

/** GET /api/reviews — every product review. ?productId= &rating= &verified= &sort=-date|rating, plus pagination + format. */
export const GET = collectionRoute(REVIEWS as (typeof REVIEWS[number] & Record<string, unknown>)[], {
  root: "reviews",
  item: "review",
  searchFields: ["title", "body", "author", "productName"],
  filterFields: ["productId", "rating", "verified"],
  sortFields: ["date", "rating"],
});
