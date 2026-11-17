import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/** Detail pages for products, posts, jobs and properties are added as those sections are built. */
export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/login", "/api-docs"].map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.6,
  }));
}
