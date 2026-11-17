import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { GUIDES } from "@/lib/learn";

export const metadata: Metadata = {
  title: "Learn",
  description: "Short guides to scraping responsibly: robots.txt, rate limits, terms of service and ethical automation.",
  alternates: { canonical: "/learn" },
};

export default function LearnHub() {
  return (
    <div className="container py-4">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Learn", href: "/learn" }]} />
      <h1 className="h3">Learn</h1>
      <p className="text-body-secondary col-lg-8">
        Everything on this site may be scraped. Most of the web is different. These guides cover what to check and how to
        behave before you run a scraper against a site you don&apos;t own. Each one uses this site&apos;s real files and
        endpoints as examples.
      </p>
      <ol className="list-unstyled row row-cols-1 row-cols-md-2 g-3 mt-2" data-testid="guides">
        {GUIDES.map((g, i) => (
          <li className="col" key={g.slug}>
            <div className="card h-100 border-0 shadow-sm feature-card">
              <div className="card-body">
                <p className="small text-body-secondary mb-1">Guide {i + 1}</p>
                <h2 className="h5 card-title">
                  <Link href={`/learn/${g.slug}`} className="stretched-link text-body text-decoration-none">{g.title}</Link>
                </h2>
                <p className="small mb-0">{g.summary}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
      <p className="small text-body-secondary mt-4 col-lg-8">
        These guides are general information, not legal advice. The law on scraping differs between countries and keeps
        changing. If a project depends on it, ask a lawyer.
      </p>
    </div>
  );
}
