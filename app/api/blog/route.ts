import { collectionRoute } from "@/lib/collection-route";
import { DATASETS, type BlogPost } from "@/lib/data";

/** GET /api/blog — ?q= &category= &authorName= &sort=publishedAt|-publishedAt|title, plus pagination + format. */
export const GET = collectionRoute(DATASETS.blog as (BlogPost & Record<string, unknown>)[], {
  root: "posts",
  item: "post",
  searchFields: ["title", "excerpt", "authorName", "category"],
  filterFields: ["category", "authorName"],
  sortFields: ["publishedAt", "title", "readingTimeMinutes"],
  summarize: ({ body: _body, ...rest }) => rest,
});
