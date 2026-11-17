import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Dynamic content challenges",
  description: "Pages that load data after the first render: AJAX, the Fetch API, delayed rendering and lazy loading.",
  alternates: { canonical: "/dynamic" },
};

const DYNAMIC_PAGES = [
  {
    title: "AJAX (XMLHttpRequest)",
    href: "/dynamic/ajax",
    how: "A jobs table is fetched with XMLHttpRequest after the page loads. The HTML only contains a Loading… row.",
    tip: "Wait for the table's data-state to become \"loaded\", or find the request in the network panel and call it directly.",
  },
  {
    title: "Fetch API search",
    href: "/dynamic/fetch",
    how: "Search-as-you-type: each change sends a debounced fetch() and older requests are cancelled.",
    tip: "After typing, wait for the result summary to update for your query, not just for any response to arrive.",
  },
  {
    title: "Delayed rendering",
    href: "/dynamic/delayed",
    how: "Panels appear after 1, 3 and 5 seconds, a price changes after it first appears, and one element never appears.",
    tip: "Use explicit waits on specific conditions with timeouts. Fixed sleeps will either be too short or waste time.",
  },
  {
    title: "Lazy loading",
    href: "/dynamic/lazy-loading",
    how: "Images load only as they scroll into view — natively and with a data-src swap — and a section renders on scroll.",
    tip: "Native lazy images have their real URL in src; data-src images don't until scrolled into view. Read data-src or scroll first.",
  },
];

export default function DynamicHub() {
  return (
    <div className="container py-4">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Challenges", href: "/challenges" }, { label: "Dynamic content", href: "/dynamic" }]} />
      <h1 className="h3">Dynamic content</h1>
      <p className="text-body-secondary col-lg-8">
        On these pages, the HTML your HTTP client downloads is not what a visitor sees. Content arrives later via JavaScript —
        practise waiting for it with Playwright, Selenium or Puppeteer, or find the underlying API and skip the browser entirely.
      </p>
      <div className="row row-cols-1 row-cols-md-2 g-3 mt-2" data-testid="dynamic-pages">
        {DYNAMIC_PAGES.map((s) => (
          <div className="col" key={s.href}>
            <div className="card h-100 border-0 shadow-sm feature-card">
              <div className="card-body">
                <h2 className="h5 card-title">
                  <Link href={s.href} className="stretched-link text-body text-decoration-none">{s.title}</Link>
                </h2>
                <p className="small mb-2">{s.how}</p>
                <p className="small text-body-secondary mb-0"><strong>Tip:</strong> {s.tip}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
