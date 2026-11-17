import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { guideNav, type GuideSlug } from "@/lib/learn";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

/** Shared frame for /learn guides: breadcrumbs, title, Article JSON-LD and previous/next links. */
export default function GuideLayout({ slug, children }: { slug: GuideSlug; children: React.ReactNode }) {
  const { guide, prev, next } = guideNav(slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: guide.title,
    description: guide.summary,
    url: absoluteUrl(`/learn/${slug}`),
    publisher: { "@type": "Organization", name: SITE_NAME },
    isPartOf: { "@type": "CreativeWorkSeries", name: `${SITE_NAME} guides`, url: absoluteUrl("/learn") },
  };
  return (
    <div className="container py-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Learn", href: "/learn" }, { label: guide.title, href: `/learn/${slug}` }]} />
      <article className="guide col-lg-8" data-guide={slug}>
        <h1 className="h2 mb-2">{guide.title}</h1>
        <p className="lead text-body-secondary mb-4">{guide.summary}</p>
        {children}
      </article>
      <nav className="d-flex flex-wrap justify-content-between gap-3 border-top pt-4 mt-5 col-lg-8" aria-label="Guides">
        {prev ? <Link href={`/learn/${prev.slug}`} rel="prev">← {prev.title}</Link> : <Link href="/learn">← All guides</Link>}
        {next ? <Link href={`/learn/${next.slug}`} rel="next">{next.title} →</Link> : <Link href="/learn">All guides →</Link>}
      </nav>
    </div>
  );
}

/** A preformatted code sample with a language label. */
export function Code({ lang, children }: { lang: string; children: string }) {
  return (
    <figure className="code-block my-3">
      <figcaption>{lang}</figcaption>
      <pre><code>{children.trim()}</code></pre>
    </figure>
  );
}
