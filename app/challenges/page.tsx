import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Challenges",
  description: "Hands-on scraping and automation challenges: pagination styles and dynamic content, each with a known answer.",
  alternates: { canonical: "/challenges" },
};

const GROUPS = [
  {
    title: "Pagination",
    href: "/pagination",
    text: "Collect all 200 products through numbered pages, cursors, a Load more button and infinite scroll.",
    links: [
      { href: "/products", label: "Numbered pages" },
      { href: "/pagination/cursor", label: "Cursor pages" },
      { href: "/pagination/load-more", label: "Load more" },
      { href: "/pagination/infinite-scroll", label: "Infinite scroll" },
    ],
  },
  {
    title: "Dynamic content",
    href: "/dynamic",
    text: "Wait for content that arrives after the first render — from XHR, fetch(), timers and lazy loading.",
    links: [
      { href: "/dynamic/ajax", label: "AJAX" },
      { href: "/dynamic/fetch", label: "Fetch API search" },
      { href: "/dynamic/delayed", label: "Delayed rendering" },
      { href: "/dynamic/lazy-loading", label: "Lazy loading" },
    ],
  },
];

export default function ChallengesPage() {
  return (
    <div className="container py-4">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Challenges", href: "/challenges" }]} />
      <h1 className="h3">Challenges</h1>
      <p className="text-body-secondary col-lg-8">
        Each challenge states its expected result, so you can check your scraper or automation script against a known answer.
      </p>
      <div className="row row-cols-1 row-cols-md-2 g-3 mt-2" data-testid="challenge-groups">
        {GROUPS.map((g) => (
          <div className="col" key={g.href}>
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <h2 className="h5"><Link href={g.href}>{g.title}</Link></h2>
                <p className="small text-body-secondary">{g.text}</p>
                <ul className="list-unstyled small mb-0">
                  {g.links.map((l) => <li key={l.href} className="mb-1"><Link href={l.href}>{l.label}</Link></li>)}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
