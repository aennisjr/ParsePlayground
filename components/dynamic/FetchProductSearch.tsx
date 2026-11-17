"use client";

import { useEffect, useState } from "react";
import type { ProductSummary } from "@/lib/data";

/**
 * Search-as-you-type with the Fetch API. Requests are debounced (300 ms) and
 * stale ones are aborted, so only the response for the latest input is shown.
 */
export default function FetchProductSearch({ categories, delayMs }: { categories: string[]; delayMs: number }) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [results, setResults] = useState<ProductSummary[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [requests, setRequests] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setStatus("loading");
      setRequests((n) => n + 1);
      const params = new URLSearchParams({ limit: "12", delay: String(delayMs) });
      if (q.trim()) params.set("q", q.trim());
      if (category) params.set("category", category);
      try {
        const res = await fetch(`/api/products?${params}`, { signal: controller.signal, headers: { accept: "application/json" } });
        if (!res.ok) throw new Error(String(res.status));
        const body = (await res.json()) as { data: ProductSummary[]; meta: { total: number } };
        setResults(body.data);
        setTotal(body.meta.total);
        setStatus("idle");
      } catch (e) {
        if ((e as Error).name !== "AbortError") setStatus("error");
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q, category, delayMs]);

  return (
    <div data-testid="fetch-search" data-state={status} data-query={q} data-category={category} data-request-count={requests}>
      <div className="row g-2 mb-3">
        <div className="col-md-7">
          <label htmlFor="fetch-q" className="form-label small fw-semibold">Search</label>
          <input id="fetch-q" type="search" className="form-control" placeholder="Try “speaker” or “Pro”" value={q} onChange={(e) => setQ(e.target.value)} data-testid="search-input" autoComplete="off" />
        </div>
        <div className="col-md-5">
          <label htmlFor="fetch-category" className="form-label small fw-semibold">Category</label>
          <select id="fetch-category" className="form-select" value={category} onChange={(e) => setCategory(e.target.value)} data-testid="category-select">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <p className="small text-body-secondary" aria-live="polite" data-testid="result-summary">
        {status === "loading" ? (
          <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />Searching…</>
        ) : status === "error" ? (
          <span className="text-danger">Search failed. Change the query to try again.</span>
        ) : total === null ? (
          "Loading…"
        ) : (
          `${total} matching products${total > results.length ? ` (showing first ${results.length})` : ""}`
        )}
      </p>

      <ul className="list-group shadow-sm" data-testid="results" style={{ opacity: status === "loading" ? 0.5 : 1 }}>
        {results.map((p) => (
          <li key={p.id} className="list-group-item d-flex justify-content-between align-items-center gap-2" data-product-id={p.id}>
            <span>
              <a href={`/products/${p.slug}`} className="name">{p.name}</a>
              <span className="small text-body-secondary ms-2 category">{p.category}</span>
            </span>
            <span className="price fw-semibold text-nowrap" data-price={p.salePrice ?? p.price}>
              {(p.salePrice ?? p.price).toLocaleString("en-US", { style: "currency", currency: "USD" })}
            </span>
          </li>
        ))}
        {status === "idle" && total === 0 && <li className="list-group-item text-body-secondary" data-testid="no-results">No products match.</li>}
      </ul>
    </div>
  );
}
