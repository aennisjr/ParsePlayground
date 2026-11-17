import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * robots.txt is part of the curriculum: it shows allowed paths, disallowed
 * paths and crawl-delay examples for different user agents.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/products", "/api/blog", "/api/jobs", "/api/real-estate", "/exports/"],
        disallow: ["/admin", "/dashboard", "/api/auth/", "/api/rate-limit/strict"],
        crawlDelay: 1,
      },
      { userAgent: "ExampleSlowBot", allow: "/", crawlDelay: 10 },
      { userAgent: "ExampleBlockedBot", disallow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
