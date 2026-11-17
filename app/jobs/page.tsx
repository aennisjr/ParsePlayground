import type { Metadata } from "next";
import Link from "next/link";
import { DATASETS, taxonomy, type Job } from "@/lib/data";
import { formatDate, formatMoney } from "@/lib/format";
import { listingSeo, runListing } from "@/lib/listing";
import Breadcrumbs from "@/components/Breadcrumbs";
import Pagination from "@/components/Pagination";
import ActiveFilters from "@/components/listing/ActiveFilters";
import FilterPanel from "@/components/listing/FilterPanel";
import ListingHeader from "@/components/listing/ListingHeader";

type SP = Promise<Record<string, string | string[] | undefined>>;

const BASE = "/jobs";
const PER_PAGE = 15;
const FILTER_KEYS = ["q", "city", "remote", "employmentType", "company", "tag", "salaryCurrency", "min_salary", "sort"] as const;
const SORTS = [
  { value: "", label: "Most recent" },
  { value: "postedAt", label: "Oldest first" },
  { value: "title", label: "Job title: A–Z" },
];
const uniq = (xs: string[]) => [...new Set(xs)].sort();
const CITIES = uniq(DATASETS.jobs.map((j) => j.city));
const TAGS = uniq(DATASETS.jobs.flatMap((j) => j.tags));
const CURRENCIES = uniq(DATASETS.jobs.map((j) => j.salaryCurrency));
// Default order is newest first.
const JOBS = [...DATASETS.jobs].sort((a, b) => b.postedAt.localeCompare(a.postedAt));

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const { params, alternates, robots } = listingSeo(BASE, await searchParams, FILTER_KEYS);
  const title = params.city ? `Jobs in ${params.city}` : "Jobs";
  return {
    title,
    description: "100 software, data and QA roles across ten cities, with salaries, tags and remote options.",
    alternates,
    robots,
    openGraph: { title, url: BASE },
  };
}

export default async function JobsPage({ searchParams }: { searchParams: SP }) {
  const { params, data, page, totalPages, total, first, last, activeKeys } = runListing(
    BASE,
    await searchParams,
    JOBS as (Job & Record<string, unknown>)[],
    {
      searchFields: ["title", "company", "location", "description"],
      filterFields: ["city", "remote", "employmentType", "company", "salaryCurrency"],
      containsFilters: [{ param: "tag", field: "tags" }],
      ranges: [{ field: "salaryMax", min: "min_salary" }],
      sortFields: ["postedAt", "title"],
      defaultLimit: PER_PAGE,
    },
    FILTER_KEYS,
  );

  return (
    <div className="container py-4">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Jobs", href: BASE }]} />
      <ListingHeader title={params.city ? `Jobs in ${params.city}` : "Job board"} basePath={BASE} params={params} total={total} first={first} last={last} noun="jobs" searchPlaceholder="Search jobs" />

      <div className="row g-4">
        <aside className="col-lg-3" aria-label="Filters">
          <FilterPanel
            basePath={BASE}
            params={params}
            sorts={SORTS}
            activeCount={activeKeys.length}
            fields={[
              { type: "select", name: "city", label: "Location", allLabel: "All locations", options: CITIES.map((c) => ({ value: c, label: c })) },
              { type: "select", name: "remote", label: "Workplace", allLabel: "Any workplace", options: ["On-site", "Hybrid", "Remote"].map((r) => ({ value: r, label: r })) },
              { type: "select", name: "employmentType", label: "Job type", allLabel: "Any job type", options: ["Full-time", "Part-time", "Contract"].map((t) => ({ value: t, label: t })) },
              { type: "select", name: "company", label: "Company", allLabel: "All companies", options: taxonomy.companies.map((c) => ({ value: c, label: c })) },
              { type: "select", name: "tag", label: "Skill", allLabel: "Any skill", options: TAGS.map((t) => ({ value: t, label: t })) },
              { type: "select", name: "salaryCurrency", label: "Salary currency", allLabel: "Any currency", options: CURRENCIES.map((c) => ({ value: c, label: c })) },
              { type: "range", label: "Salary up to at least", min: { name: "min_salary", placeholder: "e.g. 60000" } },
            ]}
          />
        </aside>

        <section className="col-lg-9" aria-label="Job listings">
          <ActiveFilters
            basePath={BASE}
            params={params}
            keys={activeKeys}
            label={(k, v) => (k === "min_salary" ? `Pays up to ≥ ${Number(v).toLocaleString("en-US")}` : k === "tag" ? `Skill: ${v}` : k === "q" ? `“${v}”` : v)}
          />
          {data.length ? (
            <ul className="list-group shadow-sm" id="job-list" data-testid="job-list">
              {data.map((j) => (
                <li className="list-group-item p-3 job-row position-relative" key={j.id} data-testid="job-row" data-job-id={j.id}>
                  <div className="d-flex flex-wrap justify-content-between gap-2">
                    <div>
                      <h2 className="h6 mb-1">
                        <Link href={`/jobs/${j.slug}`} className="job-title stretched-link text-decoration-none">{j.title}</Link>
                      </h2>
                      <div className="small">
                        <span className="company fw-semibold">{j.company}</span> · <span className="location">{j.location}</span>
                      </div>
                    </div>
                    <div className="text-md-end small">
                      <div className="salary fw-semibold" data-min={j.salaryMin} data-max={j.salaryMax} data-currency={j.salaryCurrency}>
                        {formatMoney(j.salaryMin, j.salaryCurrency)} – {formatMoney(j.salaryMax, j.salaryCurrency)}
                      </div>
                      <time className="text-body-secondary posted" dateTime={j.postedAt}>Posted {formatDate(j.postedAt)}</time>
                    </div>
                  </div>
                  <div className="mt-2 d-flex flex-wrap gap-1 small">
                    <span className={`badge ${j.remote === "Remote" ? "text-bg-success" : j.remote === "Hybrid" ? "text-bg-primary" : "text-bg-secondary"} workplace`}>{j.remote}</span>
                    <span className="badge text-bg-light border employment-type">{j.employmentType}</span>
                    {j.tags.map((t) => <span key={t} className="badge text-bg-light border text-body-secondary tag">{t}</span>)}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-5 text-body-secondary" data-testid="no-results">
              <p className="mb-2">No jobs match your filters.</p>
              <Link href={BASE} className="btn btn-outline-primary btn-sm">Clear all filters</Link>
            </div>
          )}
          <Pagination basePath={BASE} params={params} page={page} totalPages={totalPages} />
        </section>
      </div>
    </div>
  );
}
