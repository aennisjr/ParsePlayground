/**
 * Build-time data generator.
 *
 * Uses a fixed-seed PRNG so every build produces byte-identical data. That
 * matters for a scraping playground: exercises like "find the cheapest laptop"
 * must have a stable answer across deploys.
 *
 * Output: data/generated/*.json (imported by the app) and public/exports/*
 * (downloadable JSON / CSV / XML / HTML files).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const DATA_DIR = join(ROOT, "data", "generated");
const EXPORT_DIR = join(ROOT, "public", "exports");
const REFERENCE_DATE = Date.UTC(2026, 0, 1); // fixed, so dates never drift

// ---------- seeded randomness ----------
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261116);
const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];
const pickMany = <T>(arr: readonly T[], n: number): T[] => {
  const copy = [...arr];
  const out: T[] = [];
  while (out.length < n && copy.length) out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]);
  return out;
};
const round2 = (n: number) => Math.round(n * 100) / 100;
const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const daysAgo = (min: number, max: number) =>
  new Date(REFERENCE_DATE - int(min, max) * 86_400_000).toISOString();

// ---------- vocabulary ----------
const FIRST = ["Amelia", "Noah", "Priya", "Lucas", "Chen", "Sofia", "Kwame", "Hannah", "Mateo", "Aisha", "Oliver", "Yuki", "Daniel", "Fatima", "Liam", "Grace", "Ibrahim", "Elena", "Samuel", "Zara"];
const LAST = ["Okafor", "Bennett", "Nakamura", "Silva", "Patel", "Fischer", "Mensah", "Novak", "Hughes", "Rossi", "Kim", "Andersson", "Moreau", "Haddad", "Walsh", "Costa", "Ibrahim", "Lindqvist", "Reyes", "Clarke"];
const CITIES = [
  { city: "London", country: "United Kingdom", currency: "GBP" },
  { city: "Manchester", country: "United Kingdom", currency: "GBP" },
  { city: "Dublin", country: "Ireland", currency: "EUR" },
  { city: "Berlin", country: "Germany", currency: "EUR" },
  { city: "Amsterdam", country: "Netherlands", currency: "EUR" },
  { city: "New York", country: "United States", currency: "USD" },
  { city: "Austin", country: "United States", currency: "USD" },
  { city: "Toronto", country: "Canada", currency: "CAD" },
  { city: "Accra", country: "Ghana", currency: "GHS" },
  { city: "Sydney", country: "Australia", currency: "AUD" },
] as const;

// ---------- products ----------
const PRODUCT_CATEGORIES = {
  Laptops: { nouns: ["Laptop", "Ultrabook", "Notebook"], price: [499, 2899] },
  Smartphones: { nouns: ["Phone", "Smartphone"], price: [199, 1499] },
  Audio: { nouns: ["Headphones", "Earbuds", "Speaker", "Soundbar"], price: [29, 499] },
  Wearables: { nouns: ["Smartwatch", "Fitness Band", "Smart Ring"], price: [49, 799] },
  Cameras: { nouns: ["Mirrorless Camera", "Action Camera", "Webcam"], price: [59, 2499] },
  Home: { nouns: ["Smart Bulb", "Robot Vacuum", "Air Purifier", "Thermostat"], price: [19, 899] },
  Gaming: { nouns: ["Controller", "Gaming Mouse", "Mechanical Keyboard", "Headset"], price: [39, 349] },
  Accessories: { nouns: ["USB-C Hub", "Power Bank", "Laptop Stand", "Charging Dock"], price: [15, 149] },
} as const;
const BRANDS = ["Nordwave", "Altura", "Kestrel", "Lumio", "Vantix", "Orbitron", "Halcyon", "Brightforge", "Quill & Co", "Meridian"];
const ADJECTIVES = ["Pro", "Air", "Max", "Lite", "Plus", "Ultra", "Mini", "X", "S", "Neo"];
const REVIEW_TITLES = ["Exactly what I needed", "Solid value", "Better than expected", "Mixed feelings", "Would buy again", "Not for me", "Great build quality", "Battery could be better"];
const REVIEW_BODIES = [
  "Setup took less than ten minutes and it has worked flawlessly since.",
  "The build quality is excellent, although the instructions could be clearer.",
  "Performance is great for the price. I compared three alternatives before choosing this one.",
  "Shipping was quick. After two weeks of daily use I have no complaints.",
  "It does the job, but I expected the battery to last longer.",
  "Customer support replaced a faulty unit within a week, which I appreciated.",
];

type Review = { id: string; author: string; rating: number; title: string; body: string; date: string; verified: boolean };
const categoryNames = Object.keys(PRODUCT_CATEGORIES) as (keyof typeof PRODUCT_CATEGORIES)[];

const products = Array.from({ length: 200 }, (_, i) => {
  const id = i + 1;
  const category = pick(categoryNames);
  const spec = PRODUCT_CATEGORIES[category];
  const brand = pick(BRANDS);
  const name = `${brand} ${pick(spec.nouns)} ${pick(ADJECTIVES)} ${int(2, 9)}`;
  const price = round2(int(spec.price[0], spec.price[1]) - 0.01);
  const onSale = rand() < 0.25;
  const reviews: Review[] = Array.from({ length: int(0, 8) }, (_, r) => ({
    id: `${id}-${r + 1}`,
    author: `${pick(FIRST)} ${pick(LAST).charAt(0)}.`,
    rating: int(1, 5),
    title: pick(REVIEW_TITLES),
    body: pick(REVIEW_BODIES),
    date: daysAgo(1, 400),
    verified: rand() < 0.8,
  }));
  const rating = reviews.length ? round2(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : null;
  const inventory = rand() < 0.1 ? 0 : int(1, 250);
  return {
    id,
    sku: `PP-${category.slice(0, 3).toUpperCase()}-${String(id).padStart(4, "0")}`,
    slug: `${slugify(name)}-${id}`,
    name,
    brand,
    category,
    price,
    salePrice: onSale ? round2(price * (1 - int(10, 40) / 100)) : null,
    currency: "USD",
    inventory,
    inStock: inventory > 0,
    rating,
    reviewCount: reviews.length,
    description: `The ${name} is part of the ${brand} ${category.toLowerCase()} range, designed for everyday reliability. It ships with a ${int(1, 3)}-year warranty and free returns within 30 days.`,
    tags: pickMany(["bestseller", "new", "eco", "refurbished", "limited", "gift-idea", "premium", "budget"], int(0, 3)),
    createdAt: daysAgo(1, 900),
    reviews,
  };
});
// Related products: same category, deterministic.
const productsWithRelated = products.map((p) => ({
  ...p,
  relatedIds: products.filter((o) => o.category === p.category && o.id !== p.id).slice(0, 4).map((o) => o.id),
}));

// ---------- blog ----------
const BLOG_CATEGORIES = ["Scraping Basics", "Browser Automation", "Data Engineering", "Ethics & Law", "Testing", "APIs"];
const BLOG_TOPICS = [
  "Parsing HTML tables with BeautifulSoup", "Handling infinite scroll in Playwright", "Respecting robots.txt in practice",
  "Building a polite Scrapy spider", "Cursor vs offset pagination", "Waiting strategies in Selenium",
  "Extracting JSON-LD from product pages", "Working with CSRF tokens", "Rate limit headers explained",
  "Choosing CSS selectors that survive redesigns", "XPath for nested structures", "Session cookies for scrapers",
  "Exporting scraped data to CSV", "Testing login flows end to end", "Retry and backoff patterns",
  "Detecting lazy-loaded content", "Reading sitemaps to discover URLs", "Headless vs headed browsers",
  "Structuring a data extraction pipeline", "When to use an API instead of scraping",
];
const PARAGRAPHS = [
  "Before writing a single line of code, look at how the page actually loads its data. Open the network panel, reload, and note which requests return the content you care about. Very often the data you want arrives as JSON from an endpoint you can call directly.",
  "Selectors are the most fragile part of any scraper. Prefer stable attributes such as data-testid or semantic structure over generated class names, which can change on every deploy.",
  "Always identify your client honestly with a descriptive User-Agent, and keep your request rate modest. A crawler that behaves like a considerate visitor is far less likely to cause problems for the site operator.",
  "Pagination comes in several shapes: numbered pages, next links, offsets and opaque cursors. Each has trade-offs, and a robust scraper should detect the end of the result set rather than assuming a fixed number of pages.",
  "Dynamic pages render content after the initial HTML arrives. A browser automation tool can wait for a specific element to appear, which is far more reliable than sleeping for a fixed amount of time.",
  "Store raw responses alongside parsed output while you are developing. When a parser breaks, you can replay the saved HTML instead of hitting the site again.",
  "Treat HTTP 429 responses as a signal, not an obstacle. Read the Retry-After header, back off, and resume at a slower pace.",
  "Validate the data you extract. Prices without currencies, dates without time zones and empty fields are common sources of silent errors downstream.",
];
const authors = Array.from({ length: 12 }, (_, i) => {
  const name = `${FIRST[i]} ${LAST[i]}`;
  return { id: i + 1, slug: slugify(name), name, role: pick(["Staff Writer", "QA Engineer", "Data Engineer", "Developer Advocate"]), bio: `${name.split(" ")[0]} writes about practical data extraction and test automation.` };
});
const blogPosts = Array.from({ length: 200 }, (_, i) => {
  const id = i + 1;
  const topic = BLOG_TOPICS[i % BLOG_TOPICS.length];
  const part = Math.floor(i / BLOG_TOPICS.length) + 1;
  const title = part === 1 ? topic : `${topic}, part ${part}`;
  const body = pickMany(PARAGRAPHS, int(4, 7));
  const author = pick(authors);
  return {
    id,
    slug: `${slugify(title)}-${id}`,
    title,
    excerpt: body[0].slice(0, 160).replace(/\s+\S*$/, "") + "…",
    body,
    authorId: author.id,
    authorName: author.name,
    category: pick(BLOG_CATEGORIES),
    tags: pickMany(["python", "javascript", "playwright", "selenium", "scrapy", "http", "ethics", "testing", "json"], int(1, 4)),
    publishedAt: daysAgo(0, 1100),
    readingTimeMinutes: Math.max(2, Math.round(body.join(" ").split(/\s+/).length / 200)),
  };
}).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

// ---------- jobs ----------
const COMPANIES = ["Datadyne", "Brightpath Analytics", "Northwind Labs", "Cobalt Systems", "Pinecrest Health", "Lumen Retail", "Sable Logistics", "Fernway Media", "Atlas Fintech", "Orchid Robotics"];
const JOB_TITLES = ["Data Engineer", "QA Automation Engineer", "Frontend Developer", "Backend Developer", "Data Analyst", "SDET", "Platform Engineer", "Machine Learning Engineer", "Product Manager", "Technical Writer"];
const SENIORITY = ["Junior", "Mid-level", "Senior", "Lead"] as const;
const jobs = Array.from({ length: 100 }, (_, i) => {
  const id = i + 1;
  const level = pick(SENIORITY);
  const title = `${level} ${pick(JOB_TITLES)}`;
  const loc = pick(CITIES);
  const base = { Junior: 35, "Mid-level": 55, Senior: 80, Lead: 100 }[level] * 1000;
  const min = base + int(0, 20) * 1000;
  const company = pick(COMPANIES);
  return {
    id,
    slug: `${slugify(title)}-${id}`,
    title,
    company,
    location: `${loc.city}, ${loc.country}`,
    remote: pick(["On-site", "Hybrid", "Remote"]),
    employmentType: pick(["Full-time", "Full-time", "Contract", "Part-time"]),
    salaryMin: min,
    salaryMax: min + int(10, 40) * 1000,
    salaryCurrency: loc.currency,
    tags: pickMany(["python", "typescript", "sql", "aws", "azure", "playwright", "selenium", "docker", "kubernetes", "react"], int(2, 5)),
    postedAt: daysAgo(0, 60),
    description: `${company} is hiring a ${title} to join a growing team in ${loc.city}. You will work closely with engineering and product to deliver reliable, well-tested software.`,
  };
});

// ---------- real estate ----------
const STREETS = ["Oak", "Maple", "Harbour", "Station", "Park", "Mill", "Church", "Victoria", "King", "Riverside"];
const STREET_TYPES = ["Road", "Street", "Avenue", "Lane", "Close", "Drive"];
const PROPERTY_TYPES = ["Apartment", "Terraced House", "Semi-Detached House", "Detached House", "Studio", "Penthouse"];
const FEATURES = ["Garden", "Parking", "Balcony", "Garage", "En-suite", "Home office", "Solar panels", "EV charger", "Lift", "Concierge"];
const properties = Array.from({ length: 150 }, (_, i) => {
  const id = i + 1;
  const loc = pick(CITIES);
  const type = pick(PROPERTY_TYPES);
  const bedrooms = type === "Studio" ? 0 : int(1, 5);
  const listingType = rand() < 0.7 ? "sale" : "rent";
  const street = `${int(1, 220)} ${pick(STREETS)} ${pick(STREET_TYPES)}`;
  return {
    id,
    slug: `${slugify(`${type} ${street} ${loc.city}`)}-${id}`,
    title: `${bedrooms ? `${bedrooms} bed ` : ""}${type} in ${loc.city}`,
    listingType,
    propertyType: type,
    price: listingType === "sale" ? int(120, 1800) * 1000 : int(800, 5000),
    pricePeriod: listingType === "rent" ? "month" : null,
    currency: loc.currency,
    address: { street, city: loc.city, postcode: `${String.fromCharCode(65 + int(0, 25))}${int(1, 99)} ${int(1, 9)}${String.fromCharCode(65 + int(0, 25))}${String.fromCharCode(65 + int(0, 25))}`, country: loc.country },
    bedrooms,
    bathrooms: Math.max(1, bedrooms - int(0, 2)),
    areaSqm: int(25, 320),
    features: pickMany(FEATURES, int(1, 5)),
    agent: `${pick(LAST)} & ${pick(LAST)} Estates`,
    listedAt: daysAgo(0, 120),
  };
});

// ---------- write ----------
function toCsv(rows: Record<string, unknown>[]): string {
  const cols = Object.keys(rows[0]).filter((k) => typeof rows[0][k] !== "object" || Array.isArray(rows[0][k]) || rows[0][k] === null);
  const esc = (v: unknown) => {
    const s = v == null ? "" : Array.isArray(v) ? v.join("|") : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n") + "\n";
}
const xmlEsc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
function toXmlValue(key: string, v: unknown): string {
  if (Array.isArray(v)) return `<${key}>${v.map((x) => toXmlValue("item", x)).join("")}</${key}>`;
  if (v && typeof v === "object") return `<${key}>${Object.entries(v).map(([k, x]) => toXmlValue(k, x)).join("")}</${key}>`;
  return v == null ? `<${key}/>` : `<${key}>${xmlEsc(String(v))}</${key}>`;
}
const toXml = (root: string, item: string, rows: object[]) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<${root}>${rows.map((r) => toXmlValue(item, r)).join("\n")}</${root}>\n`;
function toHtml(title: string, rows: Record<string, unknown>[]): string {
  const csv = toCsv(rows).trim().split("\n");
  const cols = csv[0].split(",");
  const body = rows
    .map((r) => `<tr>${cols.map((c) => `<td>${xmlEsc(Array.isArray(r[c]) ? (r[c] as unknown[]).join(", ") : String(r[c] ?? ""))}</td>`).join("")}</tr>`)
    .join("\n");
  return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><title>${title} export</title></head><body>\n<h1>${title}</h1>\n<table id="export">\n<thead><tr>${cols.map((c) => `<th>${c}</th>`).join("")}</tr></thead>\n<tbody>\n${body}\n</tbody></table>\n</body></html>\n`;
}

mkdirSync(DATA_DIR, { recursive: true });
mkdirSync(EXPORT_DIR, { recursive: true });

const datasets = {
  products: { rows: productsWithRelated, root: "products", item: "product" },
  blog: { rows: blogPosts, root: "posts", item: "post" },
  jobs: { rows: jobs, root: "jobs", item: "job" },
  "real-estate": { rows: properties, root: "properties", item: "property" },
};
for (const [name, { rows, root, item }] of Object.entries(datasets)) {
  writeFileSync(join(DATA_DIR, `${name}.json`), JSON.stringify(rows, null, 2));
  writeFileSync(join(EXPORT_DIR, `${name}.json`), JSON.stringify(rows, null, 2));
  writeFileSync(join(EXPORT_DIR, `${name}.csv`), toCsv(rows as Record<string, unknown>[]));
  writeFileSync(join(EXPORT_DIR, `${name}.xml`), toXml(root, item, rows));
  writeFileSync(join(EXPORT_DIR, `${name}.html`), toHtml(name, rows as Record<string, unknown>[]));
}
writeFileSync(join(DATA_DIR, "authors.json"), JSON.stringify(authors, null, 2));
writeFileSync(
  join(DATA_DIR, "taxonomy.json"),
  JSON.stringify({ productCategories: categoryNames, brands: BRANDS, blogCategories: BLOG_CATEGORIES, companies: COMPANIES }, null, 2),
);

console.log(`Generated ${products.length} products, ${blogPosts.length} posts, ${jobs.length} jobs, ${properties.length} properties.`);
