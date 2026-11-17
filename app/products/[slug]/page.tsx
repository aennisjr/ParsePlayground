import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DATASETS } from "@/lib/data";
import { formatDate, formatMoney } from "@/lib/format";
import { absoluteUrl } from "@/lib/site";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";
import Rating from "@/components/Rating";

type Params = Promise<{ slug: string }>;

// All 200 product pages are pre-rendered at build time; unknown slugs 404.
export const dynamicParams = false;
export function generateStaticParams() {
  return DATASETS.products.map((p) => ({ slug: p.slug }));
}

const findBySlug = (slug: string) => DATASETS.products.find((p) => p.slug === slug);

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = findBySlug((await params).slug);
  if (!p) return {};
  const path = `/products/${p.slug}`;
  return {
    title: `${p.name} — ${p.category}`,
    description: p.description,
    alternates: { canonical: path },
    openGraph: { type: "website", title: p.name, description: p.description, url: path },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const p = findBySlug((await params).slug);
  if (!p) notFound();

  const related = p.relatedIds.map((id) => DATASETS.products.find((o) => o.id === id)).filter((o) => o !== undefined);
  const price = p.salePrice ?? p.price;
  const url = absoluteUrl(`/products/${p.slug}`);

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: p.sku,
    description: p.description,
    brand: { "@type": "Brand", name: p.brand },
    category: p.category,
    url,
    offers: {
      "@type": "Offer",
      url,
      price,
      priceCurrency: p.currency,
      availability: p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: p.tags.includes("refurbished") ? "https://schema.org/RefurbishedCondition" : "https://schema.org/NewCondition",
    },
    ...(p.rating != null && {
      aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviewCount, bestRating: 5, worstRating: 1 },
      review: p.reviews.map((r) => ({
        "@type": "Review",
        author: { "@type": "Person", name: r.author },
        datePublished: r.date.slice(0, 10),
        name: r.title,
        reviewBody: r.body,
        reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
      })),
    }),
  };

  return (
    <div className="container py-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/products" },
          { label: p.category, href: `/products?category=${encodeURIComponent(p.category)}` },
          { label: p.name, href: `/products/${p.slug}` },
        ]}
      />

      <div className="row g-4 g-lg-5" id="product" data-product-id={p.id} data-sku={p.sku}>
        <div className="col-md-6">
          <div className="rounded overflow-hidden shadow-sm">
            <ProductImage name={p.name} category={p.category} large />
          </div>
        </div>
        <div className="col-md-6">
          <p className="text-body-secondary mb-1">
            <Link href={`/products?brand=${encodeURIComponent(p.brand)}`} className="brand">{p.brand}</Link>
          </p>
          <h1 className="h2 product-title">{p.name}</h1>
          <div className="mb-3"><Rating value={p.rating} count={p.reviewCount} /></div>

          <div className="d-flex align-items-baseline gap-3 mb-3" data-testid="price-block">
            <span className={`display-6 fw-bold price ${p.salePrice ? "text-danger" : ""}`} data-price={price} data-currency={p.currency}>
              {formatMoney(price)}
            </span>
            {p.salePrice && (
              <>
                <s className="text-body-secondary price-original" data-price={p.price}>{formatMoney(p.price)}</s>
                <span className="badge text-bg-danger" data-testid="discount">
                  Save {Math.round((1 - p.salePrice / p.price) * 100)}%
                </span>
              </>
            )}
          </div>

          <p className="lead fs-6">{p.description}</p>

          <dl className="row small mb-4" id="product-details">
            <dt className="col-4 text-body-secondary fw-normal">SKU</dt>
            <dd className="col-8 sku" data-testid="sku">{p.sku}</dd>
            <dt className="col-4 text-body-secondary fw-normal">Category</dt>
            <dd className="col-8 category">{p.category}</dd>
            <dt className="col-4 text-body-secondary fw-normal">Availability</dt>
            <dd className="col-8" data-testid="availability" data-stock={p.inventory}>
              {p.inStock ? (
                <span className="text-success">In stock{p.inventory < 10 && ` — only ${p.inventory} left`}</span>
              ) : (
                <span className="text-danger">Out of stock</span>
              )}
            </dd>
            {p.tags.length > 0 && (
              <>
                <dt className="col-4 text-body-secondary fw-normal">Tags</dt>
                <dd className="col-8">
                  {p.tags.map((t) => <span key={t} className="badge text-bg-light border me-1 tag">{t}</span>)}
                </dd>
              </>
            )}
          </dl>

          <button type="button" className="btn btn-primary btn-lg" disabled={!p.inStock} data-testid="add-to-cart">
            {p.inStock ? "Add to cart" : "Sold out"}
          </button>
          <p className="small text-body-secondary mt-2 mb-0">
            Data for this product: <a href={`/api/products/${p.id}`}>JSON</a> · <a href={`/api/products/${p.id}?format=xml`}>XML</a>
          </p>
        </div>
      </div>

      <section className="mt-5" id="reviews" aria-labelledby="reviews-heading">
        <h2 className="h4" id="reviews-heading">
          Customer reviews <span className="text-body-secondary fs-6">({p.reviewCount})</span>
        </h2>
        {p.reviews.length === 0 ? (
          <p className="text-body-secondary" data-testid="no-reviews">This product has no reviews yet.</p>
        ) : (
          <div className="row g-3">
            {p.reviews.map((r) => (
              <div className="col-md-6" key={r.id}>
                <article className="card border-0 shadow-sm h-100 review" data-testid="review" data-review-id={r.id} data-rating={r.rating}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <Rating value={r.rating} />
                      <time className="small text-body-secondary" dateTime={r.date}>{formatDate(r.date)}</time>
                    </div>
                    <h3 className="h6 mt-2 mb-1 review-title">{r.title}</h3>
                    <p className="small mb-2 review-body">{r.body}</p>
                    <p className="small text-body-secondary mb-0">
                      <span className="review-author">{r.author}</span>
                      {r.verified && <span className="badge text-bg-success ms-2 verified">Verified purchase</span>}
                    </p>
                  </div>
                </article>
              </div>
            ))}
          </div>
        )}
      </section>

      {related.length > 0 && (
        <section className="mt-5" aria-labelledby="related-heading" data-testid="related-products">
          <h2 className="h4" id="related-heading">Related products</h2>
          <div className="row row-cols-2 row-cols-md-4 g-3">
            {related.map((r) => <div className="col" key={r.id}><ProductCard product={r} /></div>)}
          </div>
        </section>
      )}
    </div>
  );
}
