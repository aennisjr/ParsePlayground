import type { Metadata } from "next";
import Link from "next/link";
import GuideLayout, { Code } from "@/components/learn/GuideLayout";
import { guideNav } from "@/lib/learn";

const { guide } = guideNav("responsible-scraping");
export const metadata: Metadata = {
  title: guide.title,
  description: guide.summary,
  alternates: { canonical: "/learn/responsible-scraping" },
  openGraph: { type: "article", title: guide.title, description: guide.summary },
};

export default function ResponsibleScraping() {
  return (
    <GuideLayout slug="responsible-scraping">
      <p>
        A scraper is a guest on someone else&apos;s server. The site owner pays for every request it makes and gets
        nothing back. Scraping responsibly means keeping that cost small and staying within what the owner allows.
      </p>

      <h2 id="checklist">Before you start</h2>
      <ol>
        <li><strong>Look for an API or a download.</strong> A documented API or data export is faster, more stable and plainly allowed. This site has both: the <Link href="/api-docs">JSON/CSV/XML API</Link> and files under <code>/exports/</code>.</li>
        <li><strong>Read robots.txt.</strong> It lists the paths the owner doesn&apos;t want crawled and may ask for a delay between requests. See the <Link href="/learn/robots-txt">robots.txt guide</Link>.</li>
        <li><strong>Read the terms of service.</strong> Some sites forbid automated access, or limit what you can do with the data. See the <Link href="/learn/terms-of-service">terms of service guide</Link>.</li>
        <li><strong>Decide what you actually need.</strong> If you need 50 product prices, fetch 50 product pages, not the whole catalogue.</li>
      </ol>

      <h2 id="while-running">While it runs</h2>
      <ul>
        <li><strong>Identify yourself.</strong> Send a <code>User-Agent</code> that names your bot and gives a way to contact you. A site owner who can reach you can ask you to slow down instead of blocking you.</li>
        <li><strong>Go slowly.</strong> Make one request at a time, with a pause between them. Use the <code>Crawl-delay</code> from robots.txt if there is one. Otherwise, a second or more is a reasonable starting point.</li>
        <li><strong>Back off when asked.</strong> A <code>429 Too Many Requests</code> or <code>503 Service Unavailable</code> response means stop and wait. Respect <code>Retry-After</code>. See the <Link href="/learn/rate-limits">rate limits guide</Link>.</li>
        <li><strong>Cache what you fetch.</strong> Don&apos;t download the same page twice in one run. Use <code>ETag</code> and <code>Last-Modified</code> to skip pages that haven&apos;t changed since the last run.</li>
        <li><strong>Run at quiet times</strong> for large jobs, such as overnight in the site&apos;s main time zone.</li>
        <li><strong>Stop on surprises.</strong> If you start getting errors, login pages or CAPTCHAs, stop and find out why. Don&apos;t push through.</li>
      </ul>

      <h2 id="example">A polite fetch loop</h2>
      <p>This Python example identifies itself, checks robots.txt, waits between requests and stops when the server says to.</p>
      <Code lang="Python">{`
import time
import urllib.robotparser
import requests

BASE = "https://parseplayground.com"
AGENT = "MyPriceBot/1.0 (+mailto:you@example.com)"

robots = urllib.robotparser.RobotFileParser(f"{BASE}/robots.txt")
robots.read()
delay = robots.crawl_delay(AGENT) or 1

session = requests.Session()
session.headers["User-Agent"] = AGENT

for page in range(1, 4):
    url = f"{BASE}/products?page={page}"
    if not robots.can_fetch(AGENT, url):
        print("robots.txt disallows", url)
        continue
    r = session.get(url, timeout=30)
    if r.status_code in (429, 503):
        wait = int(r.headers.get("Retry-After", 60))
        print(f"Server asked us to wait {wait}s")
        time.sleep(wait)
        continue
    r.raise_for_status()
    print(url, len(r.text), "bytes")
    time.sleep(delay)
`}</Code>
      <p className="small text-body-secondary">
        This simple version skips the page that got a 429. A real scraper would retry it after waiting.
      </p>

      <h2 id="data">Afterwards: the data</h2>
      <p>
        Being allowed to fetch a page doesn&apos;t make every use of its content acceptable. Republishing articles or images
        can infringe copyright. Collecting information about people brings in data protection law. The{" "}
        <Link href="/learn/ethical-automation">ethical automation guide</Link> covers both.
      </p>
    </GuideLayout>
  );
}
