import type { MetadataRoute } from "next";
import { authors, DATASETS } from "@/lib/data";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const entry = (path: string, priority: number, lastModified?: string, changeFrequency: "weekly" | "monthly" = "monthly") => ({
    url: absoluteUrl(path),
    ...(lastModified && { lastModified }),
    changeFrequency,
    priority,
  });
  return [
    entry("/", 1, undefined, "weekly"),
    ...["/products", "/blog", "/jobs", "/real-estate", "/pagination", "/pagination/cursor", "/pagination/load-more", "/pagination/infinite-scroll", "/challenges", "/dynamic", "/dynamic/ajax", "/dynamic/fetch", "/dynamic/delayed", "/dynamic/lazy-loading", "/api-docs", "/login", "/learn", "/learn/responsible-scraping", "/learn/robots-txt", "/learn/rate-limits", "/learn/terms-of-service", "/learn/ethical-automation", "/status"].map((p) => entry(p, 0.8, undefined, "weekly")),
    ...DATASETS.products.map((p) => entry(`/products/${p.slug}`, 0.6, p.createdAt)),
    ...DATASETS.blog.map((p) => entry(`/blog/${p.slug}`, 0.6, p.publishedAt)),
    ...authors.map((a) => entry(`/blog/authors/${a.slug}`, 0.4)),
    ...DATASETS.jobs.map((j) => entry(`/jobs/${j.slug}`, 0.6, j.postedAt)),
    ...DATASETS["real-estate"].map((p) => entry(`/real-estate/${p.slug}`, 0.6, p.listedAt)),
  ];
}
