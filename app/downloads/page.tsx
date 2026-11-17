import type { Metadata } from "next";
import Link from "next/link";
import { statSync } from "node:fs";
import { join } from "node:path";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Code } from "@/components/learn/GuideLayout";
import { DATASETS } from "@/lib/data";
import { tableColumns } from "@/lib/serialize";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Downloads",
  description: "Download every product, blog post, job and property on ParsePlayground as JSON, CSV, XML or an HTML table.",
  alternates: { canonical: "/downloads" },
};

const FILES = [
  { key: "products", label: "Products", page: "/products", api: "/api/products", leftOut: "reviews" },
  { key: "blog", label: "Blog posts", page: "/blog", api: "/api/blog", leftOut: "sections (the article text)" },
  { key: "jobs", label: "Jobs", page: "/jobs", api: "/api/jobs", leftOut: null },
  { key: "real-estate", label: "Real estate", page: "/real-estate", api: "/api/real-estate", leftOut: null },
] as const;

const FORMATS = [
  { ext: "json", label: "JSON", mime: "application/json" },
  { ext: "csv", label: "CSV", mime: "text/csv" },
  { ext: "xml", label: "XML", mime: "application/xml" },
  { ext: "html", label: "HTML", mime: "text/html" },
] as const;

/** File sizes are read once at build time; `npm run generate` writes the files before `next build`. */
function size(file: string) {
  try {
    const bytes = statSync(join(process.cwd(), "public", "exports", file)).size;
    return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
  } catch {
    return null;
  }
}

export default function DownloadsPage() {
  const rows = FILES.map((f) => {
    const data = DATASETS[f.key] as unknown as Record<string, unknown>[];
    return {
      ...f,
      count: data.length,
      columns: tableColumns(data).cols,
      files: FORMATS.map((fmt) => ({ ...fmt, href: `/exports/${f.key}.${fmt.ext}`, size: size(`${f.key}.${fmt.ext}`) })),
    };
  });

  const jsonLd = rows.map((r) => ({
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `${SITE_NAME} ${r.label.toLowerCase()}`,
    description: `${r.count} made-up ${r.label.toLowerCase()} for practising web scraping and data extraction.`,
    url: absoluteUrl("/downloads"),
    isAccessibleForFree: true,
    creator: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl("/") },
    distribution: r.files.map((f) => ({ "@type": "DataDownload", encodingFormat: f.mime, contentUrl: absoluteUrl(f.href) })),
  }));

  return (
    <div className="container py-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Downloads", href: "/downloads" }]} />
      <h1 className="h3">Downloads</h1>
      <p className="text-body-secondary col-lg-8">
        Every record on this site as a single file. Use these to check your scraper&apos;s output against the real data,
        or to practise parsing each format. The data is generated from a fixed seed, so it&apos;s the same on every
        deploy and answers like &ldquo;the cheapest laptop&rdquo; don&apos;t change.
      </p>

      <div className="table-responsive mt-4">
        <table className="table bg-white shadow-sm align-middle" id="downloads">
          <thead>
            <tr>
              <th scope="col">Dataset</th>
              <th scope="col" className="text-end">Records</th>
              {FORMATS.map((f) => <th scope="col" key={f.ext}>{f.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} data-dataset={r.key}>
                <th scope="row"><Link href={r.page}>{r.label}</Link></th>
                <td className="text-end" data-field="count">{r.count}</td>
                {r.files.map((f) => (
                  <td key={f.ext} data-format={f.ext}>
                    <a href={f.href} type={f.mime} {...(f.ext === "html" ? {} : { download: `${r.key}.${f.ext}` })}>{`${r.key}.${f.ext}`}</a>
                    {f.size && <div className="small text-body-secondary">{f.size}</div>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small text-body-secondary">
        Need only part of a dataset? The <Link href="/api-docs">API</Link> returns the same records filtered, sorted and
        paginated, in JSON, CSV or XML.
      </p>

      <div className="row g-4 mt-2">
        <div className="col-lg-7">
          <h2 className="h5">The formats</h2>
          <dl id="format-notes">
            <dt>JSON</dt>
            <dd>An array with every field of every record, including nested ones such as product reviews and blog sections.</dd>
            <dt>XML</dt>
            <dd>
              The same complete records. Each file has one root element (<code>&lt;products&gt;</code>,{" "}
              <code>&lt;posts&gt;</code>, <code>&lt;jobs&gt;</code>, <code>&lt;properties&gt;</code>) with one child per
              record. List entries are wrapped in <code>&lt;item&gt;</code> elements.
            </dd>
            <dt>CSV</dt>
            <dd>
              UTF-8 without a byte order mark, comma-separated, with a header row and LF line endings. Fields that contain
              commas, quotes or line breaks are quoted. Lists are joined with <code>|</code>, and nested objects become
              dotted columns such as <code>address.city</code>. Lists of objects don&apos;t fit in one cell, so they&apos;re
              left out; get them from JSON or XML.
            </dd>
            <dt>HTML</dt>
            <dd>
              A standalone page with one <code>table#export</code> holding the same columns as the CSV. Good practice for
              table parsers such as <code>pandas.read_html</code>.
            </dd>
          </dl>

          <h2 className="h5 mt-4">Reading them</h2>
          <Code lang="Shell">{`
curl -O https://parseplayground.com/exports/products.csv
`}</Code>
          <Code lang="Python">{`
import pandas as pd

base = "https://parseplayground.com/exports"
products = pd.read_json(f"{base}/products.json")
jobs = pd.read_csv(f"{base}/jobs.csv")
homes = pd.read_xml(f"{base}/real-estate.xml", xpath="/properties/property")
posts = pd.read_html(f"{base}/blog.html", attrs={"id": "export"})[0]

products["tags"].head()                      # JSON keeps lists as lists
jobs["tags"].str.split("|").head()           # CSV joins them with |
`}</Code>
          <p className="small text-body-secondary">
            <code>read_xml</code> needs the <code>lxml</code> package, and <code>read_html</code> needs{" "}
            <code>lxml</code> or <code>beautifulsoup4</code> with <code>html5lib</code>. Some real estate and blog
            fields contain non-ASCII characters such as ² and …. Excel may show them wrongly if you double-click the CSV. Use{" "}
            <em>Data → From Text/CSV</em> and choose UTF-8 instead.
          </p>
        </div>

        <div className="col-lg-5">
          <h2 className="h5">Columns</h2>
          <p className="small text-body-secondary">The CSV and HTML columns for each dataset.</p>
          {rows.map((r) => (
            <details key={r.key} className="mb-2" data-columns={r.key}>
              <summary>{r.label} <span className="text-body-secondary small">({r.columns.length} columns)</span></summary>
              <p className="small mt-2 mb-1"><code className="text-break">{r.columns.join(", ")}</code></p>
              {r.leftOut && <p className="small text-body-secondary mb-0">JSON and XML only: {r.leftOut}.</p>}
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
