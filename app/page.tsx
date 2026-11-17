import type { Metadata } from "next";
import Link from "next/link";
import { DATASETS } from "@/lib/data";
import { GUIDES } from "@/lib/learn";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const AREAS = [
  { title: "E-commerce", count: DATASETS.products.length, unit: "products", href: "/products", api: "/api/products", text: "Categories, brands, inventory, ratings and reviews with filters, sorting and search." },
  { title: "Blog", count: DATASETS.blog.length, unit: "articles", href: "/blog", api: "/api/blog", text: "Authors, categories and publication dates — ideal for crawling and pagination practice." },
  { title: "Job board", count: DATASETS.jobs.length, unit: "listings", href: "/jobs", api: "/api/jobs", text: "Salaries in multiple currencies, locations, tags and employment types." },
  { title: "Real estate", count: DATASETS["real-estate"].length, unit: "properties", href: "/real-estate", api: "/api/real-estate", text: "Structured addresses, prices for sale or rent, and property features." },
];

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="hero py-5 mb-5">
        <div className="container py-4">
          <h1 className="display-5 fw-bold">The legal playground for web scraping</h1>
          <p className="lead col-lg-8 opacity-75">{SITE_DESCRIPTION}</p>
          <div className="d-flex gap-2 mt-4">
            <Link href="/login" className="btn btn-info btn-lg">Try the login challenge</Link>
            <Link href="/api-docs" className="btn btn-outline-light btn-lg">Explore the API</Link>
          </div>
        </div>
      </section>
      <div className="container">
        <div className="row g-4">
          {AREAS.map((a) => (
            <div className="col-md-6 col-lg-3" key={a.title}>
              <div className="card h-100 feature-card border-0 shadow-sm" data-area={a.title.toLowerCase()}>
                <div className="card-body">
                  <h2 className="h5 card-title"><a href={a.href} className="stretched-link text-body text-decoration-none">{a.title}</a></h2>
                  <p className="text-body-secondary small">{a.text}</p>
                  <p className="mb-0"><span className="fw-bold fs-4">{a.count}</span> {a.unit}</p>
                </div>
                <div className="card-footer bg-transparent border-0">
                  <code className="endpoint small">{a.api}</code>
                </div>
              </div>
            </div>
          ))}
        </div>

        <section className="mt-5" aria-labelledby="challenges-heading">
          <h2 className="h4" id="challenges-heading"><Link href="/challenges" className="text-body text-decoration-none">Challenges</Link></h2>
          <p className="text-body-secondary">Each challenge has a known answer, so you can check your scraper.</p>
          <h3 className="h6 text-uppercase small text-body-secondary mt-3">Pagination</h3>
          <div className="d-flex flex-wrap gap-2" data-testid="challenge-links">
            <Link href="/products" className="btn btn-outline-dark btn-sm">Numbered pages</Link>
            <Link href="/pagination/cursor" className="btn btn-outline-dark btn-sm">Cursor pages</Link>
            <Link href="/pagination/load-more" className="btn btn-outline-dark btn-sm">Load more button</Link>
            <Link href="/pagination/infinite-scroll" className="btn btn-outline-dark btn-sm">Infinite scroll</Link>
          </div>
          <h3 className="h6 text-uppercase small text-body-secondary mt-3">Dynamic content</h3>
          <div className="d-flex flex-wrap gap-2">
            <Link href="/dynamic/ajax" className="btn btn-outline-dark btn-sm">AJAX</Link>
            <Link href="/dynamic/fetch" className="btn btn-outline-dark btn-sm">Fetch API search</Link>
            <Link href="/dynamic/delayed" className="btn btn-outline-dark btn-sm">Delayed rendering</Link>
            <Link href="/dynamic/lazy-loading" className="btn btn-outline-dark btn-sm">Lazy loading</Link>
          </div>
        </section>

        <section className="mt-5" aria-labelledby="learn-heading">
          <h2 className="h4" id="learn-heading"><Link href="/learn" className="text-body text-decoration-none">Learn to scrape responsibly</Link></h2>
          <p className="text-body-secondary">Short guides that use this site&apos;s real robots.txt, rate limits and terms as examples.</p>
          <div className="d-flex flex-wrap gap-2" data-testid="guide-links">
            {GUIDES.map((g) => <Link key={g.slug} href={`/learn/${g.slug}`} className="btn btn-outline-dark btn-sm">{g.title}</Link>)}
          </div>
        </section>
      </div>
    </>
  );
}
