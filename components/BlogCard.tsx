import Link from "next/link";
import type { BlogPost } from "@/lib/data";
import { formatDate } from "@/lib/format";

export default function BlogCard({ post: p }: { post: BlogPost }) {
  return (
    <article className="card h-100 border-0 shadow-sm feature-card blog-card" data-testid="post-card" data-post-id={p.id}>
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center small mb-2">
          <Link href={`/blog?category=${encodeURIComponent(p.category)}`} className="badge text-bg-info text-decoration-none category">{p.category}</Link>
          <span className="text-body-secondary reading-time" data-minutes={p.readingTimeMinutes}>{p.readingTimeMinutes} min read</span>
        </div>
        <h2 className="h5 card-title">
          <Link href={`/blog/${p.slug}`} className="post-title text-body text-decoration-none">{p.title}</Link>
        </h2>
        <p className="small text-body-secondary excerpt flex-grow-1">{p.excerpt}</p>
        <div className="small d-flex justify-content-between flex-wrap gap-1">
          <Link href={`/blog/authors/${p.authorSlug}`} className="author" rel="author">{p.authorName}</Link>
          <time className="text-body-secondary" dateTime={p.publishedAt}>{formatDate(p.publishedAt)}</time>
        </div>
      </div>
    </article>
  );
}
