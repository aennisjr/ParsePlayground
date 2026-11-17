"use client";

import { useEffect, useRef, useState } from "react";

type Item = { id: number; sku: string; name: string; image: string };

/** Placeholder shown until a data-src image is swapped in (a tiny grey SVG). */
const BLANK = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='%23e9ecef'/%3E%3C/svg%3E";

/**
 * Two lazy-loading techniques side by side:
 * - native: <img loading="lazy" src="…"> — the real URL is in the HTML
 * - data-src: <img src="placeholder" data-src="…"> — JavaScript swaps in the real URL when the image nears the viewport
 */
export function LazyImageGrid({ items, mode }: { items: Item[]; mode: "native" | "data-src" }) {
  const grid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode !== "data-src" || !grid.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const img = e.target as HTMLImageElement;
          img.src = img.dataset.src!;
          img.removeAttribute("data-src");
          img.classList.remove("lazy");
          img.dataset.loaded = "true";
          observer.unobserve(img);
        }
      },
      { rootMargin: "200px 0px" },
    );
    grid.current.querySelectorAll("img[data-src]").forEach((img) => observer.observe(img));
    return () => observer.disconnect();
  }, [mode]);

  return (
    <div ref={grid} className="row row-cols-2 row-cols-sm-3 row-cols-lg-6 g-2" data-testid={`gallery-${mode}`}>
      {items.map((p) => (
        <figure className="col mb-0" key={p.id} data-product-id={p.id}>
          {mode === "native" ? (
            <img src={p.image} alt={p.name} width={400} height={400} loading="lazy" decoding="async" className="img-fluid rounded" />
          ) : (
            <img src={BLANK} data-src={p.image} alt={p.name} width={400} height={400} className="img-fluid rounded lazy" />
          )}
          <figcaption className="small text-body-secondary text-truncate mt-1">{p.sku}</figcaption>
        </figure>
      ))}
    </div>
  );
}

type Review = { id: string; author: string; rating: number; title: string; date: string; productName: string; productSlug: string };

/**
 * Reviews that are fetched from /api/reviews only when this section scrolls
 * into view. Until then they exist nowhere in the page — not in the HTML and
 * not in any embedded data.
 */
export function LazyReviews({ count, delayMs }: { count: number; delayMs: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [state, setState] = useState<"waiting" | "loading" | "loaded" | "error">("waiting");

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(async ([e]) => {
      if (!e.isIntersecting) return;
      observer.disconnect();
      setState("loading");
      try {
        const res = await fetch(`/api/reviews?sort=-date&limit=${count}&delay=${delayMs}`, { headers: { accept: "application/json" } });
        if (!res.ok) throw new Error(String(res.status));
        setReviews(((await res.json()) as { data: Review[] }).data);
        setState("loaded");
      } catch {
        setState("error");
      }
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [count, delayMs]);

  const date = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

  return (
    <div ref={ref} data-testid="lazy-section" data-state={state} style={{ minHeight: 200 }}>
      {state === "waiting" && <p className="text-body-secondary small">Scroll here to load the latest reviews…</p>}
      {state === "loading" && (
        <p className="text-body-secondary small"><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />Loading reviews…</p>
      )}
      {state === "error" && <p className="text-danger small">Couldn&apos;t load reviews. Reload the page to try again.</p>}
      {reviews && (
        <ul className="list-group shadow-sm" data-testid="latest-reviews">
          {reviews.map((r) => (
            <li className="list-group-item" key={r.id} data-review-id={r.id} data-rating={r.rating}>
              <div className="d-flex justify-content-between small">
                <a href={`/products/${r.productSlug}`}>{r.productName}</a>
                <time dateTime={r.date} className="text-body-secondary">{date(r.date)}</time>
              </div>
              <div className="fw-semibold">{r.title} <span className="text-warning">{"★".repeat(r.rating)}</span></div>
              <div className="small text-body-secondary">{r.author}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
