import type { Metadata } from "next";
import Link from "next/link";
import { listQuery } from "@/lib/api";
import { DATASETS, taxonomy, type Product } from "@/lib/data";
import { buildQuery, cleanParams } from "@/lib/format";
import { absoluteUrl } from "@/lib/site";
import Breadcrumbs from "@/components/Breadcrumbs";
import Pagination from "@/components/Pagination";
import ProductCard from "@/components/ProductCard";

type SP = Promise<Record<string, string | string[] | undefined>>;

const PER_PAGE = 24;
const SORTS = [
  { value: "", label: "Featured" },
  { value: "price", label: "Price: low to high" },
  { value: "-price", label: "Price: high to low" },
  { value: "-rating", label: "Top rated" },
  { value: "-createdAt", label: "Newest" },
  { value: "name", label: "Name: A–Z" },
];
const FILTER_KEYS = ["q", "category", "brand", "min_price", "max_price", "inStock", "sort"] as const;

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const params = cleanParams(await searchParams);
  const filtered = FILTER_KEYS.some((k) => params[k]);
  const page = Number(params.page ?? 1);
  const title = params.category ? `${params.category} — Shop` : "Shop all products";
  return {
    title,
    description: "Browse 200 electronics products with filters, sorting, search and pagination — a realistic e-commerce catalogue built for scraping practice.",
    // Filtered views point at the unfiltered listing; plain pages are canonical to themselves.
    alternates: { canonical: filtered ? "/products" : page > 1 ? `/products?page=${page}` : "/products" },
    robots: filtered ? { index: false, follow: true } : undefined,
    openGraph: { title, url: "/products" },
  };
}

export default async function ProductsPage({ searchParams }: { searchParams: SP }) {
  const params = cleanParams(await searchParams);
  const url = new URL(`http://local/products${buildQuery(params)}`);
  const { data, meta } = listQuery(url, DATASETS.products as (Product & Record<string, unknown>)[], {
    searchFields: ["name", "brand", "category", "description"],
    filterFields: ["category", "brand", "inStock"],
    sortFields: ["price", "rating", "name", "createdAt"],
    defaultLimit: PER_PAGE,
  });
  const page = Number(meta.page ?? 1);
  const totalPages = Number(meta.totalPages ?? 1);
  const total = Number(meta.total);
  const first = total ? (page - 1) * PER_PAGE + 1 : 0;
  const last = Math.min(total, page * PER_PAGE);
  const activeFilters = FILTER_KEYS.filter((k) => k !== "sort" && params[k]);

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
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop", href: "/products" }]} />

      <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3">
        <div>
          <h1 className="h3 mb-1">{params.category ?? "All products"}</h1>
          <p className="text-body-secondary small mb-0" data-testid="result-count" data-total={total}>
            {total ? `Showing ${first}–${last} of ${total} products` : "No products match your filters"}
          </p>
        </div>
        <form method="get" action="/products" className="d-flex gap-2" role="search" data-testid="search-form">
          {Object.entries(params)
            .filter(([k]) => k !== "q" && k !== "page")
            .map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
          <input type="search" name="q" defaultValue={params.q ?? ""} className="form-control" placeholder="Search products" aria-label="Search products" data-testid="search-input" />
          <button className="btn btn-dark" type="submit">Search</button>
        </form>
      </div>

      <div className="row g-4">
        <aside className="col-lg-3" aria-label="Filters">
          {/* Collapsed behind a "Filters" toggle on small screens; always visible on large screens (see globals.css). */}
          <details className="filters-details" data-testid="filters-toggle">
            <summary className="btn btn-outline-secondary btn-sm w-100 mb-2">Filters{activeFilters.length > 0 && ` (${activeFilters.length})`}</summary>
          <form method="get" action="/products" className="card border-0 shadow-sm" id="filters" data-testid="filters">
            <div className="card-body">
              {params.q && <input type="hidden" name="q" value={params.q} />}
              <div className="mb-3">
                <label htmlFor="sort" className="form-label small fw-semibold">Sort by</label>
                <select id="sort" name="sort" className="form-select form-select-sm" defaultValue={params.sort ?? ""} data-testid="sort-select">
                  {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="category" className="form-label small fw-semibold">Category</label>
                <select id="category" name="category" className="form-select form-select-sm" defaultValue={params.category ?? ""} data-testid="category-select">
                  <option value="">All categories</option>
                  {taxonomy.productCategories.map((c) => <option key={c} value={c}>{c} ({categoryCounts[c]})</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="brand" className="form-label small fw-semibold">Brand</label>
                <select id="brand" name="brand" className="form-select form-select-sm" defaultValue={params.brand ?? ""} data-testid="brand-select">
                  <option value="">All brands</option>
                  {taxonomy.brands.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <fieldset className="mb-3">
                <legend className="form-label small fw-semibold">Price (USD)</legend>
                <div className="d-flex gap-2">
                  <input type="number" name="min_price" min={0} className="form-control form-control-sm" placeholder="Min" aria-label="Minimum price" defaultValue={params.min_price ?? ""} data-testid="min-price" />
                  <input type="number" name="max_price" min={0} className="form-control form-control-sm" placeholder="Max" aria-label="Maximum price" defaultValue={params.max_price ?? ""} data-testid="max-price" />
                </div>
              </fieldset>
              <div className="form-check mb-3">
                <input className="form-check-input" type="checkbox" name="inStock" value="true" id="inStock" defaultChecked={params.inStock === "true"} data-testid="in-stock" />
                <label className="form-check-label small" htmlFor="inStock">In stock only</label>
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary btn-sm flex-grow-1" data-testid="apply-filters">Apply</button>
                {activeFilters.length > 0 && <Link href="/products" className="btn btn-outline-secondary btn-sm" data-testid="clear-filters">Clear</Link>}
              </div>
            </div>
          </form>
          </details>

          <nav className="mt-4 d-none d-lg-block" aria-label="Categories">
            <h2 className="h6 text-uppercase small text-body-secondary">Categories</h2>
            <ul className="list-unstyled small" id="category-links">
              {taxonomy.productCategories.map((c) => (
                <li key={c}>
                  <Link href={`/products?category=${encodeURIComponent(c)}`} className={params.category === c ? "fw-bold" : ""}>{c}</Link>{" "}
                  <span className="text-body-secondary">({categoryCounts[c]})</span>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <section className="col-lg-9" aria-label="Products">
          {activeFilters.length > 0 && (
            <div className="mb-3 d-flex flex-wrap gap-2" data-testid="active-filters">
              {activeFilters.map((k) => (
                <Link key={k} href={`/products${buildQuery(params, { [k]: undefined, page: undefined })}`} className="badge rounded-pill text-bg-light border text-decoration-none" data-filter={k}>
                  {k === "inStock" ? "In stock" : k === "min_price" ? `From $${params[k]}` : k === "max_price" ? `Up to $${params[k]}` : k === "q" ? `“${params[k]}”` : params[k]} ✕
                </Link>
              ))}
            </div>
          )}
          {data.length ? (
            <div className="row row-cols-2 row-cols-md-3 g-3" id="product-grid" data-testid="product-grid">
              {data.map((p) => (
                <div className="col" key={p.id}><ProductCard product={p} /></div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5 text-body-secondary" data-testid="no-results">
              <p className="mb-2">No products match your filters.</p>
              <Link href="/products" className="btn btn-outline-primary btn-sm">Clear all filters</Link>
            </div>
          )}
          <Pagination basePath="/products" params={params} page={page} totalPages={totalPages} />
        </section>
      </div>
    </div>
  );
}
