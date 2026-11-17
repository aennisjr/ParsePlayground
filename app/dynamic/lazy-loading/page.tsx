import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { LazyImageGrid, LazyReviews } from "@/components/dynamic/LazyProductGallery";
import { DATASETS } from "@/lib/data";

export const metadata: Metadata = {
  title: "Lazy loading",
  description: "Images and sections that only load as they scroll into view.",
  alternates: { canonical: "/dynamic/lazy-loading" },
};

const pick = (from: number, n: number) =>
  DATASETS.products.slice(from, from + n).map(({ id, sku, name, image }) => ({ id, sku, name, image }));

export default function LazyLoadingPage() {
  const native = pick(0, 36);
  const dataSrc = pick(36, 36);
  return (
    <div className="container py-4">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Dynamic content", href: "/dynamic" }, { label: "Lazy loading", href: "/dynamic/lazy-loading" }]} />
      <h1 className="h3">Lazy loading</h1>
      <p className="text-body-secondary col-lg-8">
        Three ways content waits until you scroll to it. Each gallery has <strong>36 images</strong>; the reviews section at the
        bottom renders <strong>8 reviews</strong> once it scrolls into view.
      </p>

      <section className="mt-4" aria-labelledby="native-heading">
        <h2 className="h5" id="native-heading">1. Native lazy loading</h2>
        <p className="small text-body-secondary">
          <code>&lt;img loading=&quot;lazy&quot; src=&quot;…&quot;&gt;</code> — the real image URL is already in the HTML; the browser just
          delays downloading it. An HTTP client can read every <code>src</code> without scrolling.
        </p>
        <LazyImageGrid items={native} mode="native" />
      </section>

      <section className="mt-5" aria-labelledby="datasrc-heading">
        <h2 className="h5" id="datasrc-heading">2. JavaScript data-src swap</h2>
        <p className="small text-body-secondary">
          <code>&lt;img src=&quot;placeholder&quot; data-src=&quot;…&quot;&gt;</code> — <code>src</code> is a grey placeholder until the
          image nears the viewport; then a script copies <code>data-src</code> into <code>src</code> and sets{" "}
          <code>data-loaded=&quot;true&quot;</code>. Read <code>data-src</code>, or scroll before reading <code>src</code>.
        </p>
        <LazyImageGrid items={dataSrc} mode="data-src" />
      </section>

      <section className="mt-5" aria-labelledby="reviews-heading">
        <h2 className="h5" id="reviews-heading">3. A section rendered on scroll</h2>
        <p className="small text-body-secondary">
          These reviews aren&apos;t anywhere in the page until the section scrolls into view; then they&apos;re fetched from <code>/api/reviews</code>.
        </p>
        <LazyReviews count={8} delayMs={600} />
      </section>
    </div>
  );
}
