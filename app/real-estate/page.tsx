import type { Metadata } from "next";
import Link from "next/link";
import { DATASETS, type Property } from "@/lib/data";
import { buildQuery } from "@/lib/format";
import { listingSeo, runListing } from "@/lib/listing";
import Breadcrumbs from "@/components/Breadcrumbs";
import Pagination from "@/components/Pagination";
import PropertyCard from "@/components/PropertyCard";
import ActiveFilters from "@/components/listing/ActiveFilters";
import FilterPanel from "@/components/listing/FilterPanel";
import ListingHeader from "@/components/listing/ListingHeader";

type SP = Promise<Record<string, string | string[] | undefined>>;

const BASE = "/real-estate";
const PER_PAGE = 18;
const FILTER_KEYS = ["q", "listingType", "city", "propertyType", "min_beds", "min_price", "max_price", "sort"] as const;
const SORTS = [
  { value: "", label: "Newest listings" },
  { value: "price", label: "Price: low to high" },
  { value: "-price", label: "Price: high to low" },
  { value: "-areaSqm", label: "Largest first" },
  { value: "-bedrooms", label: "Most bedrooms" },
];
const uniq = (xs: string[]) => [...new Set(xs)].sort();
const CITIES = uniq(DATASETS["real-estate"].map((p) => p.city));
const TYPES = uniq(DATASETS["real-estate"].map((p) => p.propertyType));
const PROPERTIES = [...DATASETS["real-estate"]].sort((a, b) => b.listedAt.localeCompare(a.listedAt));

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const { params, alternates, robots } = listingSeo(BASE, await searchParams, FILTER_KEYS);
  const what = params.listingType === "rent" ? "Properties to rent" : params.listingType === "sale" ? "Properties for sale" : "Properties";
  const title = params.city ? `${what} in ${params.city}` : what;
  return {
    title,
    description: "150 homes for sale and to rent across ten cities, with prices, addresses, floor areas and features.",
    alternates,
    robots,
    openGraph: { title, url: BASE },
  };
}

export default async function RealEstatePage({ searchParams }: { searchParams: SP }) {
  const { params, data, page, totalPages, total, first, last, activeKeys } = runListing(
    BASE,
    await searchParams,
    PROPERTIES as (Property & Record<string, unknown>)[],
    {
      searchFields: ["title", "propertyType", "agent", "city", "description"],
      filterFields: ["listingType", "city", "propertyType"],
      ranges: [
        { field: "price", min: "min_price", max: "max_price" },
        { field: "bedrooms", min: "min_beds" },
      ],
      sortFields: ["price", "areaSqm", "bedrooms", "listedAt"],
      defaultLimit: PER_PAGE,
    },
    FILTER_KEYS,
  );
  const tab = (value: string | undefined, label: string) => (
    <li className="nav-item" key={label}>
      <Link
        href={`${BASE}${buildQuery(params, { listingType: value, page: undefined })}`}
        className={`nav-link ${params.listingType === value ? "active" : ""}`}
        aria-current={params.listingType === value ? "page" : undefined}
        data-testid={`tab-${value ?? "all"}`}
      >
        {label}
      </Link>
    </li>
  );
  const heading = `${params.listingType === "rent" ? "To rent" : params.listingType === "sale" ? "For sale" : "All properties"}${params.city ? ` in ${params.city}` : ""}`;

  return (
    <div className="container py-4">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Real estate", href: BASE }]} />
      <ListingHeader title={heading} basePath={BASE} params={params} total={total} first={first} last={last} noun="properties" searchPlaceholder="Search properties" />
      <ul className="nav nav-pills mb-3" data-testid="listing-tabs">
        {tab(undefined, "All")}
        {tab("sale", "For sale")}
        {tab("rent", "To rent")}
      </ul>

      <div className="row g-4">
        <aside className="col-lg-3" aria-label="Filters">
          <FilterPanel
            basePath={BASE}
            params={params}
            sorts={SORTS}
            activeCount={activeKeys.length}
            fields={[
              { type: "select", name: "listingType", label: "Buy or rent", allLabel: "Buy or rent", options: [{ value: "sale", label: "For sale" }, { value: "rent", label: "To rent" }] },
              { type: "select", name: "city", label: "City", allLabel: "All cities", options: CITIES.map((c) => ({ value: c, label: c })) },
              { type: "select", name: "propertyType", label: "Property type", allLabel: "Any type", options: TYPES.map((t) => ({ value: t, label: t })) },
              { type: "select", name: "min_beds", label: "Bedrooms", allLabel: "Any", options: [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n}+` })) },
              { type: "range", label: "Price (local currency)", min: { name: "min_price", placeholder: "Min" }, max: { name: "max_price", placeholder: "Max" } },
            ]}
          />
        </aside>

        <section className="col-lg-9" aria-label="Properties">
          <ActiveFilters
            basePath={BASE}
            params={params}
            keys={activeKeys}
            label={(k, v) =>
              k === "listingType" ? (v === "rent" ? "To rent" : "For sale")
              : k === "min_beds" ? `${v}+ beds`
              : k === "min_price" ? `From ${Number(v).toLocaleString("en-US")}`
              : k === "max_price" ? `Up to ${Number(v).toLocaleString("en-US")}`
              : k === "q" ? `“${v}”` : v}
          />
          {data.length ? (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-3" id="property-grid" data-testid="property-grid">
              {data.map((p) => <div className="col" key={p.id}><PropertyCard property={p} /></div>)}
            </div>
          ) : (
            <div className="text-center py-5 text-body-secondary" data-testid="no-results">
              <p className="mb-2">No properties match your filters.</p>
              <Link href={BASE} className="btn btn-outline-primary btn-sm">Clear all filters</Link>
            </div>
          )}
          <Pagination basePath={BASE} params={params} page={page} totalPages={totalPages} />
        </section>
      </div>
    </div>
  );
}
