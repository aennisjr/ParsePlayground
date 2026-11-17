import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { authors, DATASETS } from "@/lib/data";
import { absoluteUrl } from "@/lib/site";
import BlogCard from "@/components/BlogCard";
import Breadcrumbs from "@/components/Breadcrumbs";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;
export function generateStaticParams() {
  return authors.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const a = authors.find((x) => x.slug === slug);
  if (!a) return {};
  return {
    title: `${a.name} — Author`,
    description: a.bio,
    alternates: { canonical: `/blog/authors/${a.slug}` },
    openGraph: { type: "profile", title: a.name, description: a.bio, url: `/blog/authors/${a.slug}` },
  };
}

export default async function AuthorPage({ params }: { params: Params }) {
  const { slug } = await params;
  const a = authors.find((x) => x.slug === slug);
  if (!a) notFound();
  const posts = DATASETS.blog.filter((p) => p.authorId === a.id);

  const profileLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: { "@type": "Person", name: a.name, jobTitle: a.role, description: a.bio, url: absoluteUrl(`/blog/authors/${a.slug}`) },
  };

  return (
    <div className="container py-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profileLd) }} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: a.name, href: `/blog/authors/${a.slug}` }]} />
      <header className="mb-4" id="author" data-author-id={a.id}>
        <h1 className="h2 mb-1">{a.name}</h1>
        <p className="text-body-secondary mb-2">{a.role}</p>
        <p className="mb-0">{a.bio}</p>
        <p className="small text-body-secondary mt-2" data-testid="post-count" data-count={posts.length}>{posts.length} articles</p>
      </header>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3" data-testid="post-grid">
        {posts.map((p) => <div className="col" key={p.id}><BlogCard post={p} /></div>)}
      </div>
    </div>
  );
}
