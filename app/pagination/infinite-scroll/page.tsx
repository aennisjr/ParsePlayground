import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import InfiniteProductList from "@/components/pagination/InfiniteProductList";
import { productBatch } from "@/lib/pagination";

export const metadata: Metadata = {
  title: "Infinite scroll",
  description: "Products load automatically as you scroll. Practise scrolling, waiting and stopping at the end of the list.",
  alternates: { canonical: "/pagination/infinite-scroll" },
};

const PAGE_SIZE = 12;
const DELAY_MS = 800;

export default function InfiniteScrollPage() {
  const first = productBatch(`cursor=&limit=${PAGE_SIZE}`);
  return (
    <div className="container py-4">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Pagination", href: "/pagination" }, { label: "Infinite scroll", href: "/pagination/infinite-scroll" }]} />
      <h1 className="h3">Infinite scroll</h1>
      <p className="text-body-secondary col-lg-8">
        The first {PAGE_SIZE} products are in the page&apos;s HTML. Scroll down and {PAGE_SIZE} more load each time, after a short
        delay, until all {first.total} are on the page. A plain HTTP request only sees the first batch.
      </p>
      <noscript>
        <div className="alert alert-warning">
          This page needs JavaScript to load more products. Without it, use the API directly:{" "}
          <a href={`/api/products?cursor=&limit=${PAGE_SIZE}`}>/api/products?cursor=&amp;limit={PAGE_SIZE}</a>
        </div>
      </noscript>
      <InfiniteProductList initialItems={first.items} initialCursor={first.nextCursor} pageSize={PAGE_SIZE} delayMs={DELAY_MS} />
    </div>
  );
}
