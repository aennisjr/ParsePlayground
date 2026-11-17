import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — Practise web scraping legally`, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: { siteName: SITE_NAME, type: "website", description: SITE_DESCRIPTION },
  twitter: { card: "summary_large_image" },
};

const NAV = [
  { href: "/products", label: "Shop" },
  { href: "/blog", label: "Blog" },
  { href: "/jobs", label: "Jobs" },
  { href: "/real-estate", label: "Real estate" },
  { href: "/challenges", label: "Challenges" },
  { href: "/api-docs", label: "API" },
  { href: "/login", label: "Login" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="d-flex flex-column min-vh-100">
        <nav className="navbar navbar-expand navbar-dark bg-dark" data-testid="main-nav">
          <div className="container flex-wrap">
            <Link className="navbar-brand fw-semibold" href="/">
              Parse<span className="text-info">Playground</span>
            </Link>
            <ul className="navbar-nav ms-auto flex-wrap column-gap-1">
              {NAV.map((n) => (
                <li className="nav-item" key={n.href}>
                  <Link className="nav-link" href={n.href}>{n.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
        <main className="flex-grow-1">{children}</main>
        <footer className="border-top py-4 mt-5 small text-body-secondary">
          <div className="container d-flex flex-wrap justify-content-between gap-2">
            <span>© {new Date().getFullYear()} {SITE_NAME}. Built to be scraped — responsibly.</span>
            <span>
              <a href="/robots.txt">robots.txt</a> · <a href="/sitemap.xml">sitemap.xml</a> ·{" "}
              <a href="/api/health">status</a>
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
