import type { Metadata } from "next";
import Link from "next/link";
import { DATASETS, taxonomy, type Product } from "@/lib/data";
import { listingSeo, runListing } from "@/lib/listing";
import { absoluteUrl } from "@/lib/site";
import Breadcrumbs from "@/components/Breadcrumbs";
import Pagination from "@/components/Pagination";
import ProductCard from "@/components/ProductCard";
import ActiveFilters from "@/components/listing/ActiveFilters";
import FilterPanel from "@/components/listing/FilterPanel";
import ListingHeader from "@/components/listing/ListingHeader";

type SP = Promise<Record<string, string | string[] | undefined>>;

const BASE = "/products";
const PER_PAGE = 24;
const FILTER_KEYS = ["q", "category", "brand", "min_price", "max_price", "inStock", "sort"] as const;
const SORTS = [
  { value: "", label: "Featured" },
  { value: "price", label: "Price: low to high" },
  { value: "-price", label: "Price: high to low" },
  { value: "-rating", label: "Top rated" },
  { value: "-createdAt", label: "Newest" },
  { value: "name", label: "Name: A–Z" },
];

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const { params, alternates, robots } = listingSeo(BASE, await searchParams, FILTER_KEYS);
  const title = params.category ? `${params.category} — Shop` : "Shop all products";
  return {
    title,
    description: "Browse 200 electronics products with filters, sorting, search and pagination — a realistic e-commerce catalogue built for scraping practice.",
    alternates,
    robots,
    openGraph: { title, url: BASE },
  };
}

export default async function ProductsPage({ searchParams }: { searchParams: SP }) {
  const { params, data, page, totalPages, total, first, last, activeKeys } = runListing(
    BASE,
    await searchParams,
    DATASETS.products as (Product & Record<string, unknown>)[],
    {
      searchFields: ["name", "brand", "category", "description"],
      filterFields: ["category", "brand", "inStock"],
      sortFields: ["price", "rating", "name", "createdAt"],
      defaultLimit: PER_PAGE,
    },
    FILTER_KEYS,
  );

  const categoryCounts = Object.fromEntries(
    taxonomy.productCategories.map((c) => [c, DATASETS.products.filter((p) => p.category === c).length]),
  );
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: data.length,
    itemListElement: data.map((p, i) => ({ "@type": "ListItem", position: first + i, url: absoluteUrl(`/products/${p.slug}`), name: p.name })),
  };

  return (
    <div className="container py-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop", href: BASE }]} />
      <ListingHeader title={params.category ?? "All products"} basePath={BASE} params={params} total={total} first={first} last={last} noun="products" searchPlaceholder="Search products" />

      <div className="row g-4">
        <aside className="col-lg-3" aria-label="Filters">
          <FilterPanel
            basePath={BASE}
            params={params}
            sorts={SORTS}
            activeCount={activeKeys.length}
            fields={[
              { type: "select", name: "category", label: "Category", allLabel: "All categories", options: taxonomy.productCategories.map((c) => ({ value: c, label: `${c} (${categoryCounts[c]})` })) },
              { type: "select", name: "brand", label: "Brand", allLabel: "All brands", options: taxonomy.brands.map((b) => ({ value: b, label: b })) },
              { type: "range", label: "Price (USD)", min: { name: "min_price", placeholder: "Min" }, max: { name: "max_price", placeholder: "Max" } },
              { type: "checkbox", name: "inStock", label: "In stock only", value: "true", testId: "in-stock" },
            ]}
          />
          <nav className="mt-4 d-none d-lg-block" aria-label="Categories">
            <h2 className="h6 text-uppercase small text-body-secondary">Categories</h2>
            <ul className="list-unstyled small" id="category-links">
              {taxonomy.productCategories.map((c) => (
                <li key={c}>
                  <Link href={`${BASE}?category=${encodeURIComponent(c)}`} className={params.category === c ? "fw-bold" : ""}>{c}</Link>{" "}
                  <span className="text-body-secondary">({categoryCounts[c]})</span>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <section className="col-lg-9" aria-label="Products">
          <ActiveFilters
            basePath={BASE}
            params={params}
            keys={activeKeys}
            label={(k, v) => (k === "inStock" ? "In stock" : k === "min_price" ? `From $${v}` : k === "max_price" ? `Up to $${v}` : k === "q" ? `“${v}”` : v)}
          />
          {data.length ? (
            <div className="row row-cols-2 row-cols-md-3 g-3" id="product-grid" data-testid="product-grid">
              {data.map((p) => <div className="col" key={p.id}><ProductCard product={p} /></div>)}
            </div>
          ) : (
            <div className="text-center py-5 text-body-secondary" data-testid="no-results">
              <p className="mb-2">No products match your filters.</p>
              <Link href={BASE} className="btn btn-outline-primary btn-sm">Clear all filters</Link>
            </div>
          )}
          <Pagination basePath={BASE} params={params} page={page} totalPages={totalPages} />
        </section>
      </div>
    </div>
  );
}
