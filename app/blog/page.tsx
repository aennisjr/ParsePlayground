import type { Metadata } from "next";
import Link from "next/link";
import { authors, DATASETS, taxonomy, type BlogPost } from "@/lib/data";
import { listingSeo, runListing } from "@/lib/listing";
import { absoluteUrl } from "@/lib/site";
import BlogCard from "@/components/BlogCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import Pagination from "@/components/Pagination";
import ActiveFilters from "@/components/listing/ActiveFilters";
import FilterPanel from "@/components/listing/FilterPanel";
import ListingHeader from "@/components/listing/ListingHeader";

type SP = Promise<Record<string, string | string[] | undefined>>;

const BASE = "/blog";
const PER_PAGE = 12;
const FILTER_KEYS = ["q", "category", "authorSlug", "tag", "sort"] as const;
const SORTS = [
  { value: "", label: "Newest first" },
  { value: "publishedAt", label: "Oldest first" },
  { value: "title", label: "Title: A–Z" },
  { value: "readingTimeMinutes", label: "Shortest read" },
  { value: "-readingTimeMinutes", label: "Longest read" },
];
const TAGS = [...new Set(DATASETS.blog.flatMap((p) => p.tags))].sort();

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const { params, alternates, robots } = listingSeo(BASE, await searchParams, FILTER_KEYS);
  const title = params.category ? `${params.category} — Blog` : "Blog";
  return {
    title,
    description: "Articles on web scraping, browser automation, testing and responsible data collection.",
    alternates,
    robots,
    openGraph: { title, url: BASE },
  };
}

export default async function BlogPage({ searchParams }: { searchParams: SP }) {
  const { params, data, page, totalPages, total, first, last, activeKeys } = runListing(
    BASE,
    await searchParams,
    DATASETS.blog as (BlogPost & Record<string, unknown>)[],
    {
      searchFields: ["title", "excerpt", "authorName", "category"],
      filterFields: ["category", "authorSlug"],
      containsFilters: [{ param: "tag", field: "tags" }],
      sortFields: ["publishedAt", "title", "readingTimeMinutes"],
      defaultLimit: PER_PAGE,
    },
    FILTER_KEYS,
  );
  const authorName = (slug: string) => authors.find((a) => a.slug === slug)?.name ?? slug;

  const blogLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "ParsePlayground Blog",
    url: absoluteUrl(BASE),
    blogPost: data.map((p) => ({ "@type": "BlogPosting", headline: p.title, url: absoluteUrl(`/blog/${p.slug}`), datePublished: p.publishedAt })),
  };

  return (
    <div className="container py-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogLd) }} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog", href: BASE }]} />
      <ListingHeader title={params.category ?? "Blog"} basePath={BASE} params={params} total={total} first={first} last={last} noun="articles" searchPlaceholder="Search articles" />

      <div className="row g-4">
        <aside className="col-lg-3" aria-label="Filters">
          <FilterPanel
            basePath={BASE}
            params={params}
            sorts={SORTS}
            activeCount={activeKeys.length}
            fields={[
              { type: "select", name: "category", label: "Category", allLabel: "All categories", options: taxonomy.blogCategories.map((c) => ({ value: c, label: c })) },
              { type: "select", name: "authorSlug", label: "Author", allLabel: "All authors", options: authors.map((a) => ({ value: a.slug, label: a.name })) },
              { type: "select", name: "tag", label: "Tag", allLabel: "All tags", options: TAGS.map((t) => ({ value: t, label: t })) },
            ]}
          />
          <nav className="mt-4 d-none d-lg-block" aria-label="Tags">
            <h2 className="h6 text-uppercase small text-body-secondary">Popular tags</h2>
            <div className="d-flex flex-wrap gap-1" id="tag-cloud">
              {TAGS.map((t) => (
                <Link key={t} href={`${BASE}?tag=${t}`} className={`badge text-decoration-none ${params.tag === t ? "text-bg-dark" : "text-bg-light border"}`}>#{t}</Link>
              ))}
            </div>
          </nav>
        </aside>

        <section className="col-lg-9" aria-label="Articles">
          <ActiveFilters
            basePath={BASE}
            params={params}
            keys={activeKeys}
            label={(k, v) => (k === "authorSlug" ? `By ${authorName(v)}` : k === "tag" ? `#${v}` : k === "q" ? `“${v}”` : v)}
          />
          {data.length ? (
            <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3" id="post-grid" data-testid="post-grid">
              {data.map((p) => <div className="col" key={p.id}><BlogCard post={p} /></div>)}
            </div>
          ) : (
            <div className="text-center py-5 text-body-secondary" data-testid="no-results">
              <p className="mb-2">No articles match your filters.</p>
              <Link href={BASE} className="btn btn-outline-primary btn-sm">Clear all filters</Link>
            </div>
          )}
          <Pagination basePath={BASE} params={params} page={page} totalPages={totalPages} />
        </section>
      </div>
    </div>
  );
}
