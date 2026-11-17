import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { authors, DATASETS } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import BlogCard from "@/components/BlogCard";
import Breadcrumbs from "@/components/Breadcrumbs";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;
export function generateStaticParams() {
  return DATASETS.blog.map((p) => ({ slug: p.slug }));
}

const posts = DATASETS.blog; // newest first
const findBySlug = (slug: string) => posts.find((p) => p.slug === slug);

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = findBySlug((await params).slug);
  if (!p) return {};
  const path = `/blog/${p.slug}`;
  return {
    title: p.title,
    description: p.excerpt,
    authors: [{ name: p.authorName, url: `/blog/authors/${p.authorSlug}` }],
    alternates: { canonical: path },
    openGraph: { type: "article", title: p.title, description: p.excerpt, url: path, publishedTime: p.publishedAt, authors: [p.authorName], section: p.category, tags: p.tags },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const p = findBySlug((await params).slug);
  if (!p) notFound();

  const author = authors.find((a) => a.id === p.authorId)!;
  const index = posts.indexOf(p);
  const newer = posts[index - 1];
  const older = posts[index + 1];
  const seriesName = p.seriesName;
  const seriesParts = posts.filter((o) => o.seriesName === seriesName).sort((a, b) => a.seriesPart - b.seriesPart);
  const related = posts.filter((o) => o.category === p.category && o.id !== p.id && !seriesParts.includes(o)).slice(0, 3);
  const url = absoluteUrl(`/blog/${p.slug}`);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.title,
    description: p.excerpt,
    url,
    mainEntityOfPage: url,
    datePublished: p.publishedAt,
    dateModified: p.publishedAt,
    wordCount: p.wordCount,
    articleSection: p.category,
    keywords: p.tags.join(", "),
    author: { "@type": "Person", name: p.authorName, url: absoluteUrl(`/blog/authors/${p.authorSlug}`) },
    publisher: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl("/") },
  };

  return (
    <div className="container py-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: p.category, href: `/blog?category=${encodeURIComponent(p.category)}` },
          { label: p.title, href: `/blog/${p.slug}` },
        ]}
      />
      <div className="row g-4 g-lg-5">
        <article className="col-lg-8" id="article" data-post-id={p.id}>
          <header className="mb-4">
            <Link href={`/blog?category=${encodeURIComponent(p.category)}`} className="badge text-bg-info text-decoration-none mb-2 category">{p.category}</Link>
            <h1 className="display-6 fw-semibold article-title">{p.title}</h1>
            <p className="text-body-secondary small mb-0 article-meta">
              By <Link href={`/blog/authors/${p.authorSlug}`} rel="author" className="author">{p.authorName}</Link> ·{" "}
              <time dateTime={p.publishedAt} className="published">{formatDate(p.publishedAt)}</time> ·{" "}
              <span className="reading-time" data-minutes={p.readingTimeMinutes}>{p.readingTimeMinutes} min read</span>
            </p>
          </header>

          {seriesParts.length > 1 && (
            <nav className="alert alert-light border small py-2" aria-label={`Series: ${seriesName}`} data-testid="series-nav">
              <span className="me-2">Part {p.seriesPart} of {seriesParts.length} in the series <strong>{seriesName}</strong>:</span>
              <ol className="list-inline d-inline mb-0 series-parts">
                {seriesParts.map((s) => (
                  <li key={s.id} className="list-inline-item me-1">
                    {s.id === p.id ? (
                      <span className="badge text-bg-dark" aria-current="page">{s.seriesPart}</span>
                    ) : (
                      <Link href={`/blog/${s.slug}`} className="badge text-bg-light border text-decoration-none" aria-label={`Part ${s.seriesPart}`}>{s.seriesPart}</Link>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div className="article-body fs-6 lh-lg" data-testid="article-body">
            {p.sections.map((s, i) => (
              <section key={i} className="mb-4">
                {i > 0 && <h2 className="h4 mt-4">{s.heading}</h2>}
                {s.paragraphs.map((para, j) => <p key={j} className={i === 0 && j === 0 ? "lead fs-5" : undefined}>{para}</p>)}
              </section>
            ))}
          </div>

          <footer className="border-top pt-3 mt-4">
            <div className="mb-3" data-testid="tags">
              {p.tags.map((t) => <Link key={t} href={`/blog?tag=${t}`} className="badge text-bg-light border text-decoration-none me-1 tag" rel="tag">#{t}</Link>)}
            </div>
            <nav className="d-flex justify-content-between gap-3 small" aria-label="More articles" data-testid="post-nav">
              {older ? <Link href={`/blog/${older.slug}`} rel="prev" data-testid="older-post">← {older.title}</Link> : <span />}
              {newer ? <Link href={`/blog/${newer.slug}`} rel="next" className="text-end" data-testid="newer-post">{newer.title} →</Link> : <span />}
            </nav>
          </footer>
        </article>

        <aside className="col-lg-4">
          <div className="card border-0 shadow-sm" data-testid="author-box" itemScope itemType="https://schema.org/Person">
            <div className="card-body">
              <div className="small text-uppercase text-body-secondary mb-1">About the author</div>
              <h2 className="h5 mb-0" itemProp="name"><Link href={`/blog/authors/${author.slug}`}>{author.name}</Link></h2>
              <div className="small text-body-secondary mb-2" itemProp="jobTitle">{author.role}</div>
              <p className="small mb-0" itemProp="description">{author.bio}</p>
              <p className="small text-body-secondary mt-3 mb-0">This article as data: <a href={`/api/blog/${p.id}`}>JSON</a> · <a href={`/api/blog/${p.id}?format=xml`}>XML</a></p>
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-5" aria-labelledby="related-heading" data-testid="related-posts">
          <h2 className="h4" id="related-heading">More in {p.category}</h2>
          <div className="row row-cols-1 row-cols-md-3 g-3">
            {related.map((r) => <div className="col" key={r.id}><BlogCard post={r} /></div>)}
          </div>
        </section>
      )}
    </div>
  );
}
