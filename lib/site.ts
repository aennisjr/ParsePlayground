export const SITE_NAME = "ParsePlayground";
export const SITE_DESCRIPTION =
  "A legal, purpose-built playground for practising web scraping, browser automation, QA testing and data extraction.";
export const SITE_URL = (process.env.SITE_URL ?? "https://parseplayground.com").replace(/\/$/, "");

export const absoluteUrl = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
