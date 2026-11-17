import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Pagination challenges",
  description: "Practise scraping every common pagination style: numbered pages, Next links, Load more buttons, infinite scroll and cursors.",
  alternates: { canonical: "/pagination" },
};

const STYLES = [
  {
    title: "Numbered pages",
    href: "/products",
    how: "Server-rendered pages with numbered links plus Previous and Next.",
    tip: "Follow the link with rel=\"next\" until it disappears, or read the total from the result count and loop over ?page=.",
    needsJs: false,
  },
  {
    title: "Cursor pages",
    href: "/pagination/cursor",
    how: "Each page links to the next with an opaque ?after= token. No page numbers, no total.",
    tip: "You can't jump ahead or count pages. Keep following the Next link until there isn't one.",
    needsJs: false,
  },
  {
    title: "Load more button",
    href: "/pagination/load-more",
    how: "A button fetches the next 12 products with an offset request and appends them.",
    tip: "Click until the button disappears, waiting for each batch. Or skip the button: call /api/products?offset=&limit= directly.",
    needsJs: true,
  },
  {
    title: "Infinite scroll",
    href: "/pagination/infinite-scroll",
    how: "More products load automatically when you scroll near the bottom, using the cursor API.",
    tip: "Scroll and wait for the item count to grow; stop when the end message appears. Watch the network panel to find the API call.",
    needsJs: true,
  },
];

export default function PaginationHub() {
  return (
    <div className="container py-4">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Pagination", href: "/pagination" }]} />
      <h1 className="h3">Pagination challenges</h1>
      <p className="text-body-secondary col-lg-8">
        The same 200 products, delivered four different ways. Each page has a known answer, so you can check your scraper:
        every technique should collect exactly <strong>200 products</strong>, from SKU <code>PP-…-0001</code> to <code>PP-…-0200</code>.
      </p>
      <div className="row row-cols-1 row-cols-md-2 g-3 mt-2" data-testid="pagination-styles">
        {STYLES.map((s) => (
          <div className="col" key={s.href}>
            <div className="card h-100 border-0 shadow-sm feature-card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <h2 className="h5 card-title">
                    <Link href={s.href} className="stretched-link text-body text-decoration-none">{s.title}</Link>
                  </h2>
                  <span className={`badge ${s.needsJs ? "text-bg-warning" : "text-bg-success"}`}>{s.needsJs ? "Needs JavaScript" : "Plain HTML"}</span>
                </div>
                <p className="small mb-2">{s.how}</p>
                <p className="small text-body-secondary mb-0"><strong>Tip:</strong> {s.tip}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="small text-body-secondary mt-4">
        Prefer the API? <code>/api/products</code> supports <code>?page=</code>, <code>?offset=</code> and <code>?cursor=</code> pagination — see the{" "}
        <Link href="/api-docs">API reference</Link>.
      </p>
    </div>
  );
}
