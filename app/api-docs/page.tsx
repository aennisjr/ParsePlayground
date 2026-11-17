import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API reference",
  description: "Public JSON, XML and CSV endpoints for scraping and HTTP client practice.",
  alternates: { canonical: "/api-docs" },
};

const ENDPOINTS = [
  ["GET", "/api/products", "List products. Filters: q, category, brand, inStock, min_price, max_price. Sort: price, -price, rating, name, createdAt."],
  ["GET", "/api/products/{id}", "One product including reviews and related product IDs."],
  ["GET", "/api/blog", "List blog posts. Filters: q, category, authorName. Sort: publishedAt, title."],
  ["GET", "/api/jobs", "List jobs. Filters: q, company, remote, employmentType. Sort: salaryMin, salaryMax, postedAt."],
  ["GET", "/api/real-estate", "List properties. Filters: q, listingType, propertyType, bedrooms, min_price, max_price."],
  ["GET", "/api/rate-limit/{none|mild|strict}", "Rate-limit demo: unlimited, 60/min, 5/min. Inspect the X-RateLimit-* and Retry-After headers."],
  ["GET", "/api/auth/csrf", "Get a CSRF token (cookie + JSON)."],
  ["POST", "/api/auth/login", "Log in with a form post or JSON. Requires the CSRF token."],
  ["POST", "/api/auth/logout", "Clear the session cookie."],
  ["GET", "/api/auth/me", "Current session, or 401."],
  ["POST / GET", "/api/auth/jwt", "Bearer-token demo: POST credentials to get a JWT, GET with Authorization: Bearer to inspect it."],
  ["GET", "/api/health", "Health check."],
  ["GET", "/api/stats", "Request statistics for the serving instance."],
];

export default function ApiDocs() {
  return (
    <div className="container py-5">
      <h1 className="h3">API reference</h1>
      <p className="text-body-secondary">
        All list endpoints return JSON by default. Add <code>?format=xml</code> or <code>?format=csv</code>, or send an{" "}
        <code>Accept</code> header. Static downloads live under <code>/exports/</code> (e.g.{" "}
        <a href="/exports/products.csv">products.csv</a>).
      </p>
      <h2 className="h5 mt-4">Pagination styles</h2>
      <ul>
        <li>Page-based: <code>?page=2&amp;per_page=20</code></li>
        <li>Offset-based: <code>?offset=40&amp;limit=20</code></li>
        <li className="text-break">Cursor-based: start with <code>?cursor=&amp;limit=20</code>, then pass <code>meta.nextCursor</code> as <code>?cursor=</code> until it is <code>null</code></li>
      </ul>
      <div className="table-responsive mt-4">
      <table className="table bg-white shadow-sm mb-0" id="endpoints">
        <thead><tr><th>Method</th><th>Path</th><th>Description</th></tr></thead>
        <tbody>
          {ENDPOINTS.map(([m, p, d]) => (
            <tr key={p}><td><span className="badge text-bg-dark">{m}</span></td><td><code>{p}</code></td><td>{d}</td></tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
