"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ProductSummary } from "@/lib/data";
import ProductCard from "@/components/ProductCard";

/**
 * Infinite scroll backed by the cursor API. The first batch arrives in the
 * server-rendered HTML; later batches load when a sentinel element near the
 * bottom of the list scrolls into view.
 */
export default function InfiniteProductList({
  initialItems,
  initialCursor,
  pageSize,
  delayMs,
}: {
  initialItems: ProductSummary[];
  initialCursor: string | null;
  pageSize: number;
  delayMs: number;
}) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const sentinel = useRef<HTMLDivElement>(null);
  const loading = useRef(false);

  const loadMore = useCallback(async () => {
    if (!cursor || loading.current) return;
    loading.current = true;
    setStatus("loading");
    try {
      const res = await fetch(`/api/products?cursor=${encodeURIComponent(cursor)}&limit=${pageSize}&delay=${delayMs}`, {
        headers: { accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = (await res.json()) as { data: ProductSummary[]; meta: { nextCursor: string | null } };
      setItems((prev) => [...prev, ...body.data]);
      setCursor(body.meta.nextCursor);
      setStatus("idle");
    } catch {
      setStatus("error");
    } finally {
      loading.current = false;
    }
  }, [cursor, pageSize, delayMs]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !cursor || status === "error") return;
    const observer = new IntersectionObserver((entries) => entries[0].isIntersecting && loadMore(), { rootMargin: "300px 0px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [cursor, loadMore, status]);

  return (
    <div data-testid="infinite-list" data-loaded-count={items.length} data-has-more={cursor ? "true" : "false"}>
      <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3" id="product-grid" data-testid="product-grid">
        {items.map((p) => (
          <div className="col" key={p.id}><ProductCard product={p} /></div>
        ))}
      </div>

      <div ref={sentinel} data-testid="scroll-sentinel" aria-hidden="true" style={{ height: 1 }} />

      <div className="text-center py-4" aria-live="polite">
        {status === "loading" && (
          <div data-testid="loading-indicator">
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
            Loading more products…
          </div>
        )}
        {status === "error" && (
          <div className="text-danger" data-testid="load-error">
            Couldn&apos;t load more products.{" "}
            <button type="button" className="btn btn-link btn-sm p-0 align-baseline" onClick={() => setStatus("idle")}>Try again</button>
          </div>
        )}
        {!cursor && (
          <p className="text-body-secondary mb-0" data-testid="end-of-results">
            You&apos;ve reached the end — all {items.length} products are loaded.
          </p>
        )}
      </div>
    </div>
  );
}
