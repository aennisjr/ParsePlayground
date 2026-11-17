/** The educational guides under /learn, in reading order. */
export const GUIDES = [
  {
    slug: "responsible-scraping",
    title: "Responsible scraping",
    summary: "Identify yourself, go slowly, take only what you need, and prefer an API when one exists.",
  },
  {
    slug: "robots-txt",
    title: "robots.txt",
    summary: "How to read allow and disallow rules, user-agent groups and Crawl-delay, using this site's real file.",
  },
  {
    slug: "rate-limits",
    title: "Rate limits",
    summary: "What 429 and Retry-After mean, how to read X-RateLimit headers, and how to back off. Includes a live tester.",
  },
  {
    slug: "terms-of-service",
    title: "Terms of service",
    summary: "What to look for in a site's terms before you scrape it, and the terms that apply to this playground.",
  },
  {
    slug: "ethical-automation",
    title: "Ethical automation",
    summary: "Personal data, logins, CAPTCHAs and load: the questions to ask before you point a bot at someone else's site.",
  },
] as const;

export type GuideSlug = (typeof GUIDES)[number]["slug"];

export function guideNav(slug: GuideSlug) {
  const i = GUIDES.findIndex((g) => g.slug === slug);
  return { guide: GUIDES[i], prev: GUIDES[i - 1] ?? null, next: GUIDES[i + 1] ?? null };
}
