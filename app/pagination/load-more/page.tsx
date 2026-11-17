import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import LoadMoreProductList from "@/components/pagination/LoadMoreProductList";
import { productBatch } from "@/lib/pagination";

export const metadata: Metadata = {
  title: "Load more button",
  description: "A Load more button appends products in batches. Practise clicking, waiting and detecting the end of the list.",
  alternates: { canonical: "/pagination/load-more" },
};

const PAGE_SIZE = 12;
const DELAY_MS = 600;

export default function LoadMorePage() {
  const first = productBatch(`offset=0&limit=${PAGE_SIZE}`);
  return (
    <div className="container py-4">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Pagination", href: "/pagination" }, { label: "Load more", href: "/pagination/load-more" }]} />
      <h1 className="h3">Load more</h1>
      <p className="text-body-secondary col-lg-8">
        Click <strong>Load more</strong> to fetch the next {PAGE_SIZE} products. The button is disabled while a batch loads and
        disappears once all {first.total} products are shown.
      </p>
      <noscript>
        <div className="alert alert-warning">
          The Load more button needs JavaScript. Without it, use the API directly:{" "}
          <a href={`/api/products?offset=${PAGE_SIZE}&limit=${PAGE_SIZE}`}>/api/products?offset={PAGE_SIZE}&amp;limit={PAGE_SIZE}</a>
        </div>
      </noscript>
      <LoadMoreProductList initialItems={first.items} total={first.total} pageSize={PAGE_SIZE} delayMs={DELAY_MS} />
    </div>
  );
}
