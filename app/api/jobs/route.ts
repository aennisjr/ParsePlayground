import { collectionRoute } from "@/lib/collection-route";
import { DATASETS, type Job } from "@/lib/data";

/** GET /api/jobs — ?q= &company= &city= &remote= &employmentType= &tag= &min_salary= &sort=salaryMin|-salaryMax|postedAt, plus pagination + format. */
export const GET = collectionRoute(DATASETS.jobs as (Job & Record<string, unknown>)[], {
  root: "jobs",
  item: "job",
  searchFields: ["title", "company", "location", "description"],
  filterFields: ["company", "city", "country", "remote", "employmentType", "salaryCurrency"],
  containsFilters: [{ param: "tag", field: "tags" }],
  ranges: [{ field: "salaryMax", min: "min_salary" }],
  sortFields: ["salaryMin", "salaryMax", "postedAt", "title"],
});
