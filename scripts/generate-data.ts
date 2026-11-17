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
const IMAGE_DIR = join(ROOT, "public", "images", "products");
const REFERENCE_DATE = Date.UTC(2026, 10, 1); // fixed (1 Nov 2026), so dates never drift between builds

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
  image: `/images/products/${p.sku}.svg`,
  relatedIds: products.filter((o) => o.category === p.category && o.id !== p.id).slice(0, 4).map((o) => o.id),
}));

// ---------- blog ----------
const BLOG_CATEGORIES = ["Scraping Basics", "Browser Automation", "Data Engineering", "Ethics & Law", "Testing", "APIs"];
// Each topic belongs to one category and has its own opening and closing, so
// posts read as distinct articles rather than shuffled boilerplate.
const BLOG_TOPICS: { title: string; category: string; intro: string; takeaway: string }[] = [
  { title: "Parsing HTML tables with BeautifulSoup", category: "Scraping Basics", intro: "Tables look like the easiest thing on a page to scrape, until you meet merged cells, header rows that repeat every twenty lines and numbers formatted for humans rather than machines.", takeaway: "Locate the table by a stable attribute, read the header row once, and convert every cell to a typed value before you store it." },
  { title: "Handling infinite scroll in Playwright", category: "Browser Automation", intro: "Infinite scroll replaces the familiar Next button with a page that keeps growing as you move down it, which means your script has to decide when there is nothing left to load.", takeaway: "Scroll, wait for the item count to change, and stop when two consecutive scrolls add nothing new. Better still, find the JSON request the page makes and call it directly." },
  { title: "Respecting robots.txt in practice", category: "Ethics & Law", intro: "robots.txt is a short text file with a long history. It tells automated clients which parts of a site the operator would prefer they left alone, and how quickly they should crawl the rest.", takeaway: "Fetch robots.txt before you crawl, honour Disallow rules and Crawl-delay values, and re-check it periodically because sites change their policies." },
  { title: "Building a polite Scrapy spider", category: "Scraping Basics", intro: "Scrapy makes it very easy to send thousands of requests a minute. Making a spider that a site operator would be happy to see in their logs takes a few deliberate settings.", takeaway: "Turn on ROBOTSTXT_OBEY, set AutoThrottle, use a descriptive User-Agent with contact details, and cache responses while you develop." },
  { title: "Cursor vs offset pagination", category: "APIs", intro: "Offset pagination asks for 'items 40 to 60'. Cursor pagination asks for 'the next page after this marker'. The difference matters as soon as the underlying data changes while you are reading it.", takeaway: "Use cursors when the API offers them, treat them as opaque strings, and stop when the API returns no next cursor rather than when a page is short." },
  { title: "Waiting strategies in Selenium", category: "Browser Automation", intro: "Most flaky Selenium tests are timing problems in disguise. The element exists, just not yet, and a fixed sleep is either too short on a slow day or wastes time on a fast one.", takeaway: "Replace sleeps with explicit waits for a specific condition: element visible, text present, or network idle, with a sensible timeout." },
  { title: "Extracting JSON-LD from product pages", category: "Data Engineering", intro: "Many product pages already contain a clean, structured description of themselves in a script tag meant for search engines. Reading it is often more reliable than parsing the visible HTML.", takeaway: "Select script[type='application/ld+json'], parse every block, and pick the one whose @type matches what you need. Fall back to HTML only for missing fields." },
  { title: "Working with CSRF tokens", category: "Testing", intro: "Cross-site request forgery tokens are one of the first things that trip up a script trying to log in to a site: the form posts fine in a browser but fails with a 403 from code.", takeaway: "Load the form page with a session that keeps cookies, read the hidden token field, and send it back with the same session in the same request." },
  { title: "Rate limit headers explained", category: "APIs", intro: "A well-behaved API tells you how many requests you have left before it starts saying no. Reading those headers turns rate limiting from a surprise into a plan.", takeaway: "Track X-RateLimit-Remaining, slow down as it approaches zero, and when you receive a 429, wait for the number of seconds in Retry-After before trying again." },
  { title: "Choosing CSS selectors that survive redesigns", category: "Testing", intro: "A selector that worked yesterday and fails today is usually a selector that depended on something nobody promised to keep the same, such as a generated class name or the position of a div.", takeaway: "Prefer data-testid attributes, ARIA roles and visible labels. Avoid long chains of nth-child and anything that looks like a hash." },
  { title: "XPath for nested structures", category: "Scraping Basics", intro: "When the data you want is several levels deep and the markup has few useful attributes, XPath's ability to navigate up, down and sideways through the tree becomes very handy.", takeaway: "Anchor on a stable nearby element, then use relative paths and axes such as following-sibling and ancestor rather than absolute paths from the root." },
  { title: "Session cookies for scrapers", category: "Scraping Basics", intro: "Logging in once and staying logged in is a matter of keeping the cookies the server gives you and sending them back on every later request.", takeaway: "Use a session object (requests.Session, a Playwright context) for the whole run, and check for redirects to the login page as a sign the session has expired." },
  { title: "Exporting scraped data to CSV", category: "Data Engineering", intro: "CSV is the lingua franca of spreadsheets and the most common way scraped data leaves a project. It is also surprisingly easy to produce a CSV that opens incorrectly.", takeaway: "Use a proper CSV writer rather than joining strings, quote fields that contain commas or newlines, write UTF-8, and keep dates in ISO 8601." },
  { title: "Testing login flows end to end", category: "Testing", intro: "A login form is a small piece of UI with a surprising number of paths through it: success, wrong password, locked account, slow responses and expired forms.", takeaway: "Cover each account state with its own test, assert on visible messages and on the resulting URL, and give slow paths an explicit, generous timeout." },
  { title: "Retry and backoff patterns", category: "Data Engineering", intro: "Networks fail, servers restart and rate limits kick in. A scraper that gives up at the first error is fragile; one that retries instantly and forever is a nuisance.", takeaway: "Retry only on errors that can succeed later (timeouts, 429, 5xx), use exponential backoff with jitter, and cap the number of attempts." },
  { title: "Detecting lazy-loaded content", category: "Browser Automation", intro: "Lazy loading defers images and sections until they are about to scroll into view. A script that reads the page immediately sees placeholders instead of content.", takeaway: "Scroll the element into view and wait for its real attributes to appear, or read the data-src style attributes that hold the eventual values." },
  { title: "Reading sitemaps to discover URLs", category: "Scraping Basics", intro: "Before you crawl a site link by link, check whether it already publishes a list of every page it wants found. That list is usually called sitemap.xml.", takeaway: "Look for the Sitemap line in robots.txt, follow sitemap index files to their children, and use lastmod to skip pages that have not changed." },
  { title: "Headless vs headed browsers", category: "Browser Automation", intro: "Running a browser without a window is faster and works on servers, but some problems are much easier to understand when you can watch the browser do its work.", takeaway: "Develop headed with slow motion turned on, run headless in CI, and capture screenshots or traces on failure so headless runs are still debuggable." },
  { title: "Structuring a data extraction pipeline", category: "Data Engineering", intro: "A one-off script grows into a pipeline the moment someone asks for the data again next week. A little structure early on saves a rewrite later.", takeaway: "Separate fetching, parsing and storing into stages, keep raw responses, make each stage re-runnable, and validate records before they reach storage." },
  { title: "When to use an API instead of scraping", category: "Ethics & Law", intro: "If a site offers an API for the data you need, scraping its HTML is usually the harder, more fragile and less polite option.", takeaway: "Check for a documented API, a data export or a feed first. Scrape only when none exists, and read the terms of service either way." },
];
const SECTION_HEADINGS = ["A practical approach", "Step by step", "What to watch for", "Common pitfalls", "Putting it into practice", "Going further"];
const PARAGRAPHS = [
  "Before writing a single line of code, look at how the page actually loads its data. Open the network panel, reload, and note which requests return the content you care about. Very often the data you want arrives as JSON from an endpoint you can call directly.",
  "Selectors are the most fragile part of any scraper. Prefer stable attributes such as data-testid or semantic structure over generated class names, which can change on every deploy.",
  "Always identify your client honestly with a descriptive User-Agent, and keep your request rate modest. A crawler that behaves like a considerate visitor is far less likely to cause problems for the site operator.",
  "Pagination comes in several shapes: numbered pages, next links, offsets and opaque cursors. Each has trade-offs, and a robust scraper should detect the end of the result set rather than assuming a fixed number of pages.",
  "Dynamic pages render content after the initial HTML arrives. A browser automation tool can wait for a specific element to appear, which is far more reliable than sleeping for a fixed amount of time.",
  "Store raw responses alongside parsed output while you are developing. When a parser breaks, you can replay the saved HTML instead of hitting the site again.",
  "Treat HTTP 429 responses as a signal, not an obstacle. Read the Retry-After header, back off, and resume at a slower pace.",
  "Validate the data you extract. Prices without currencies, dates without time zones and empty fields are common sources of silent errors downstream.",
  "Write small, focused tests for your parsers using saved HTML fixtures. They run in milliseconds and catch layout changes long before a full crawl would.",
  "Log every request with its URL, status code and duration. When something goes wrong at two in the morning, those logs are the difference between a quick fix and a long investigation.",
  "Keep configuration such as base URLs, delays and selectors out of your code. Changing a delay should not require a redeploy.",
  "Character encodings still cause trouble. Decode responses using the charset the server declares, and normalise text before comparing or storing it.",
  "Be careful with relative URLs. Resolve every link against the page it came from, not against the site root, or you will request pages that do not exist.",
  "Deduplicate as you go. The same item often appears on several listing pages, and a stable identifier such as a SKU or ID makes duplicates easy to spot.",
  "Time zones matter more than they seem. Store timestamps in UTC and convert only when displaying them.",
  "Read the site's terms of service before you start. Many sites welcome automated access within limits and say so explicitly; others ask you to use an API instead.",
];
const authors = Array.from({ length: 12 }, (_, i) => {
  const name = `${FIRST[i]} ${LAST[i]}`;
  return { id: i + 1, slug: slugify(name), name, role: pick(["Staff Writer", "QA Engineer", "Data Engineer", "Developer Advocate"]), bio: `${name.split(" ")[0]} writes about practical data extraction and test automation.` };
});
const blogPosts = Array.from({ length: 200 }, (_, i) => {
  const id = i + 1;
  const topic = BLOG_TOPICS[i % BLOG_TOPICS.length];
  const part = Math.floor(i / BLOG_TOPICS.length) + 1;
  const title = part === 1 ? topic.title : `${topic.title}, part ${part}`;
  const headings = pickMany(SECTION_HEADINGS, 2);
  const pool = pickMany(PARAGRAPHS, int(4, 6));
  const split = Math.ceil(pool.length / 2);
  const SERIES_OPENERS = [
    "This is part {n} of our series, and this time we focus on edge cases readers asked about.",
    "In part {n} we take the ideas from earlier instalments and apply them to a larger, messier site.",
    "Part {n} looks at what changes when the same technique has to run every day in production.",
    "For part {n}, we revisit the basics with a fresh example and a few lessons learned the hard way.",
  ];
  const intro = part === 1 ? topic.intro : `${SERIES_OPENERS[(part + id) % SERIES_OPENERS.length].replace("{n}", String(part))} ${topic.intro}`;
  const sections = [
    { heading: "Introduction", paragraphs: [intro] },
    { heading: headings[0], paragraphs: pool.slice(0, split) },
    { heading: headings[1], paragraphs: pool.slice(split) },
    { heading: "Key takeaway", paragraphs: [topic.takeaway] },
  ];
  const words = sections.flatMap((s) => s.paragraphs).join(" ").split(/\s+/).length;
  const author = pick(authors);
  return {
    id,
    slug: `${slugify(title)}-${id}`,
    title,
    excerpt: intro.length > 200 ? intro.slice(0, 200).replace(/\s+\S*$/, "") + "…" : intro,
    seriesName: topic.title,
    seriesPart: part,
    sections,
    authorId: author.id,
    authorName: author.name,
    authorSlug: author.slug,
    category: topic.category,
    tags: pickMany(["python", "javascript", "playwright", "selenium", "scrapy", "http", "ethics", "testing", "json"], int(1, 4)),
    publishedAt: daysAgo(0, 1100),
    wordCount: words,
    readingTimeMinutes: Math.max(2, Math.round(words / 200)),
  };
}).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

// ---------- jobs ----------
const COMPANIES = ["Datadyne", "Brightpath Analytics", "Northwind Labs", "Cobalt Systems", "Pinecrest Health", "Lumen Retail", "Sable Logistics", "Fernway Media", "Atlas Fintech", "Orchid Robotics"];
const JOB_TITLES = ["Data Engineer", "QA Automation Engineer", "Frontend Developer", "Backend Developer", "Data Analyst", "SDET", "Platform Engineer", "Machine Learning Engineer", "Product Manager", "Technical Writer"];
const SENIORITY = ["Junior", "Mid-level", "Senior", "Lead"] as const;
const RESPONSIBILITIES = [
  "Design, build and maintain reliable services used by thousands of customers",
  "Write automated tests and keep the test suite fast and trustworthy",
  "Review code and share knowledge with the wider team",
  "Work with product managers to turn requirements into well-scoped tasks",
  "Monitor production systems and take part in a fair on-call rotation",
  "Improve documentation so new team members can get started quickly",
  "Identify bottlenecks and improve performance across the stack",
  "Contribute to technical planning and architecture discussions",
];
const BENEFITS = ["25 days holiday", "Private health insurance", "Learning budget", "Flexible working hours", "Pension matching", "Home office allowance", "Annual team retreat", "Parental leave"];
const jobs = Array.from({ length: 100 }, (_, i) => {
  const id = i + 1;
  const level = pick(SENIORITY);
  const title = `${level} ${pick(JOB_TITLES)}`;
  const loc = pick(CITIES);
  const base = { Junior: 35, "Mid-level": 55, Senior: 80, Lead: 100 }[level] * 1000;
  const min = base + int(0, 20) * 1000;
  const company = pick(COMPANIES);
  const tags = pickMany(["python", "typescript", "sql", "aws", "azure", "playwright", "selenium", "docker", "kubernetes", "react"], int(2, 5));
  const experienceYears = { Junior: 0, "Mid-level": 2, Senior: 5, Lead: 8 }[level];
  return {
    id,
    slug: `${slugify(title)}-${id}`,
    title,
    company,
    location: `${loc.city}, ${loc.country}`,
    city: loc.city,
    country: loc.country,
    remote: pick(["On-site", "Hybrid", "Remote"]),
    employmentType: pick(["Full-time", "Full-time", "Contract", "Part-time"]),
    salaryMin: min,
    salaryMax: min + int(10, 40) * 1000,
    salaryCurrency: loc.currency,
    tags,
    experienceYears,
    postedAt: daysAgo(0, 60),
    description: `${company} is hiring a ${title} to join a growing team in ${loc.city}. You will work closely with engineering and product to deliver reliable, well-tested software.`,
    responsibilities: pickMany(RESPONSIBILITIES, int(3, 5)),
    requirements: [
      experienceYears ? `${experienceYears}+ years of professional experience` : "A strong interest in software and a willingness to learn",
      ...tags.slice(0, 3).map((t) => `Hands-on experience with ${t}`),
      "Clear written and spoken communication",
    ],
    benefits: pickMany(BENEFITS, int(3, 5)),
  };
});

// ---------- real estate ----------
const STREETS = ["Oak", "Maple", "Harbour", "Station", "Park", "Mill", "Church", "Victoria", "King", "Riverside"];
const STREET_TYPES = ["Road", "Street", "Avenue", "Lane", "Close", "Drive"];
const PROPERTY_TYPES = ["Apartment", "Terraced House", "Semi-Detached House", "Detached House", "Studio", "Penthouse"];
const COMMON_FEATURES = ["Parking", "En-suite", "Home office", "EV charger", "Double glazing", "Underfloor heating"];
const HOUSE_FEATURES = ["Garden", "Garage", "Solar panels", "Driveway", "Conservatory"];
const FLAT_FEATURES = ["Balcony", "Lift", "Concierge", "Roof terrace", "Gym access"];
// "EV charger" stays as is; "Roof terrace" becomes "roof terrace" mid-sentence.
const lowerFirst = (f: string) => (/^[A-Z]{2}/.test(f) ? f : f[0].toLowerCase() + f.slice(1));
const inSentence = (xs: string[]) => {
  const w = xs.map(lowerFirst);
  return w.length > 1 ? `${w.slice(0, -1).join(", ")} and ${w[w.length - 1]}` : w[0];
};
const properties = Array.from({ length: 150 }, (_, i) => {
  const id = i + 1;
  const loc = pick(CITIES);
  const type = pick(PROPERTY_TYPES);
  const bedrooms = type === "Studio" ? 0 : int(1, 5);
  const listingType = rand() < 0.7 ? "sale" : "rent";
  const street = `${int(1, 220)} ${pick(STREETS)} ${pick(STREET_TYPES)}`;
  const features = pickMany([...COMMON_FEATURES, ...(type.includes("House") ? HOUSE_FEATURES : FLAT_FEATURES)], int(2, 5));
  const areaSqm = type === "Studio" ? int(25, 45) : int(45, 320);
  return {
    id,
    slug: `${slugify(`${type} ${street} ${loc.city}`)}-${id}`,
    title: `${bedrooms ? `${bedrooms} bed ` : ""}${type} in ${loc.city}`,
    listingType,
    propertyType: type,
    price: listingType === "sale" ? int(120, 1800) * 1000 : int(800, 5000),
    pricePeriod: listingType === "rent" ? "month" : null,
    currency: loc.currency,
    city: loc.city,
    country: loc.country,
    address: { street, city: loc.city, postcode: `${String.fromCharCode(65 + int(0, 25))}${int(1, 99)} ${int(1, 9)}${String.fromCharCode(65 + int(0, 25))}${String.fromCharCode(65 + int(0, 25))}`, country: loc.country },
    bedrooms,
    bathrooms: Math.max(1, bedrooms - int(0, 2)),
    areaSqm,
    features,
    description: `A ${bedrooms ? `${bedrooms}-bedroom ` : ""}${type.toLowerCase()} on ${street}, ${loc.city}, offering ${areaSqm} m² of living space. Highlights include ${inSentence(features)}. ${listingType === "rent" ? "Available to rent now." : "Offered for sale with no onward chain."}`,
    agent: `${pick(LAST)} & ${pick(LAST)} Estates`,
    listedAt: daysAgo(0, 120),
  };
});

// ---------- write ----------
function toCsv(rows: Record<string, unknown>[]): string {
  // A column is included only if no row holds a nested object in it.
  const isFlat = (v: unknown) => v === null || typeof v !== "object" || (Array.isArray(v) && v.every((x) => typeof x !== "object"));
  const cols = Object.keys(rows[0]).filter((k) => rows.every((r) => isFlat(r[k])));
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
mkdirSync(IMAGE_DIR, { recursive: true });

// One small SVG per product so pages have real image URLs to scrape and lazy-load.
const CATEGORY_HUES: Record<string, number> = { Laptops: 210, Smartphones: 260, Audio: 330, Wearables: 160, Cameras: 25, Home: 190, Gaming: 285, Accessories: 45 };
for (const p of products) {
  const hue = CATEGORY_HUES[p.category] ?? 200;
  const initials = p.brand.split(/s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  writeFileSync(
    join(IMAGE_DIR, `${p.sku}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" role="img" aria-label="${xmlEsc(p.name)}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue} 70% 92%)"/><stop offset="1" stop-color="hsl(${hue} 55% 78%)"/></linearGradient></defs>
<rect width="400" height="400" fill="url(#g)"/>
<text x="200" y="215" font-family="system-ui, sans-serif" font-size="96" font-weight="700" fill="hsl(${hue} 40% 35%)" text-anchor="middle">${initials}</text>
<text x="200" y="290" font-family="system-ui, sans-serif" font-size="22" fill="hsl(${hue} 30% 30%)" text-anchor="middle">${xmlEsc(p.sku)}</text>
</svg>
`,
  );
}

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
