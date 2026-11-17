import type { MetadataRoute } from "next";
import { DATASETS } from "@/lib/data";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = ["/", "/products", "/login", "/api-docs"].map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
  const products: MetadataRoute.Sitemap = DATASETS.products.map((p) => ({
    url: absoluteUrl(`/products/${p.slug}`),
    lastModified: p.createdAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));
  return [...pages, ...products];
}
