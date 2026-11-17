"use client";

import { useState } from "react";
import type { ProductSummary } from "@/lib/data";
import ProductCard from "@/components/ProductCard";

/** A "Load more" button backed by the offset API (?offset=&limit=). */
export default function LoadMoreProductList({
  initialItems,
  total,
  pageSize,
  delayMs,
}: {
  initialItems: ProductSummary[];
  total: number;
  pageSize: number;
  delayMs: number;
}) {
  const [items, setItems] = useState(initialItems);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const hasMore = items.length < total;

  async function loadMore() {
    setStatus("loading");
    try {
      const res = await fetch(`/api/products?offset=${items.length}&limit=${pageSize}&delay=${delayMs}`, {
        headers: { accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = (await res.json()) as { data: ProductSummary[] };
      setItems((prev) => [...prev, ...body.data]);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div data-testid="load-more-list" data-loaded-count={items.length} data-total={total}>
      <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3" id="product-grid" data-testid="product-grid">
        {items.map((p) => (
          <div className="col" key={p.id}><ProductCard product={p} /></div>
        ))}
      </div>

      <div className="text-center py-4">
        <p className="small text-body-secondary mb-2" data-testid="progress" aria-live="polite">
          Showing {items.length} of {total} products
        </p>
        <div className="progress mx-auto mb-3" style={{ height: 4, maxWidth: 240 }} aria-hidden="true">
          <div className="progress-bar" style={{ width: `${(items.length / total) * 100}%` }} />
        </div>
        {status === "error" && <p className="text-danger small" data-testid="load-error">Couldn&apos;t load more products. Please try again.</p>}
        {hasMore ? (
          <button type="button" className="btn btn-outline-primary px-4" onClick={loadMore} disabled={status === "loading"} data-testid="load-more-button">
            {status === "loading" ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                Loading…
              </>
            ) : (
              "Load more"
            )}
          </button>
        ) : (
          <p className="text-body-secondary mb-0" data-testid="end-of-results">All {total} products are loaded.</p>
        )}
      </div>
    </div>
  );
}
