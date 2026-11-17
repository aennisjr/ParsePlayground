import Link from "next/link";
import { absoluteUrl } from "@/lib/site";

/** Visible breadcrumbs plus matching BreadcrumbList JSON-LD. The last item is the current page. */
export default function Breadcrumbs({ items }: { items: { label: string; href: string }[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.label, item: absoluteUrl(it.href) })),
  };
  return (
    <nav aria-label="breadcrumb" data-testid="breadcrumbs">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ol className="breadcrumb small">
        {items.map((it, i) =>
          i === items.length - 1 ? (
            <li key={it.href} className="breadcrumb-item active" aria-current="page">{it.label}</li>
          ) : (
            <li key={it.href} className="breadcrumb-item"><Link href={it.href}>{it.label}</Link></li>
          ),
        )}
      </ol>
    </nav>
  );
}
