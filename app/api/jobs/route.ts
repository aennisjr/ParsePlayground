import { collectionRoute } from "@/lib/collection-route";
import { DATASETS, type Job } from "@/lib/data";

/** GET /api/jobs — ?q= &company= &remote= &employmentType= &sort=salaryMin|-salaryMax|postedAt, plus pagination + format. */
export const GET = collectionRoute(DATASETS.jobs as (Job & Record<string, unknown>)[], {
  root: "jobs",
  item: "job",
  searchFields: ["title", "company", "location", "description"],
  filterFields: ["company", "remote", "employmentType", "salaryCurrency"],
  sortFields: ["salaryMin", "salaryMax", "postedAt", "title"],
});
