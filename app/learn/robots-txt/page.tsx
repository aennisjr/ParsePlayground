import type { Metadata, MetadataRoute } from "next";
import GuideLayout, { Code } from "@/components/learn/GuideLayout";
import { guideNav } from "@/lib/learn";
import robots from "@/app/robots";

const { guide } = guideNav("robots-txt");
export const metadata: Metadata = {
  title: guide.title,
  description: guide.summary,
  alternates: { canonical: "/learn/robots-txt" },
  openGraph: { type: "article", title: guide.title, description: guide.summary },
};

const list = (v: string | string[] | undefined) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

/** Renders the same rules app/robots.ts serves, so this page can't drift from the real file. */
function robotsText(r: MetadataRoute.Robots): string {
  const lines: string[] = [];
  for (const rule of Array.isArray(r.rules) ? r.rules : [r.rules]) {
    for (const ua of list(rule.userAgent)) lines.push(`User-Agent: ${ua}`);
    for (const a of list(rule.allow)) lines.push(`Allow: ${a}`);
    for (const d of list(rule.disallow)) lines.push(`Disallow: ${d}`);
    if (rule.crawlDelay !== undefined) lines.push(`Crawl-delay: ${rule.crawlDelay}`);
    lines.push("");
  }
  if (r.host) lines.push(`Host: ${r.host}`);
  for (const s of list(r.sitemap)) lines.push(`Sitemap: ${s}`);
  return lines.join("\n");
}

export default function RobotsGuide() {
  return (
    <GuideLayout slug="robots-txt">
      <p>
        <code>robots.txt</code> is a plain text file at the root of a site, such as <code>/robots.txt</code>. It tells
        crawlers which paths the owner doesn&apos;t want them to visit. It&apos;s a request, not a lock: nothing stops a
        bot from ignoring it. But it&apos;s the clearest statement you&apos;ll get of what the owner wants, and ignoring it
        is a common reason for getting blocked. Since 2022 the format has been a formal standard, RFC 9309.
      </p>

      <h2 id="this-site">This site&apos;s file</h2>
      <p>
        This is the live content of <a href="/robots.txt">/robots.txt</a>. It was written to show each feature of the
        format.
      </p>
      <Code lang="robots.txt">{robotsText(robots())}</Code>

      <h2 id="reading">How to read it</h2>
      <dl>
        <dt><code>User-Agent</code></dt>
        <dd>
          Starts a group of rules. A crawler uses the group whose name best matches its own product token and ignores the
          others. <code>*</code> is for any crawler without a group of its own. Here, <code>ExampleSlowBot</code> gets only
          its own group, so it must wait 10 seconds between requests and the <code>*</code> rules don&apos;t apply to it.
        </dd>
        <dt><code>Disallow</code> and <code>Allow</code></dt>
        <dd>
          Path prefixes. <code>Disallow: /admin</code> covers <code>/admin</code>, <code>/admin/users</code> and{" "}
          <code>/administrator</code>, because it matches any path starting with those characters. When an Allow and a
          Disallow rule both match, the longer (more specific) one wins. <code>Disallow: /</code> blocks the whole site, as
          for <code>ExampleBlockedBot</code>. An empty <code>Disallow:</code> blocks nothing.
        </dd>
        <dt><code>Crawl-delay</code></dt>
        <dd>
          Seconds to wait between requests. It isn&apos;t part of RFC 9309 and Google ignores it, but many sites use it.
          If a site gives one, treat it as the minimum gap between requests.
        </dd>
        <dt><code>Sitemap</code></dt>
        <dd>
          The full URL of an XML sitemap listing the pages the owner wants found. Following a sitemap is often easier
          than crawling links. Try <a href="/sitemap.xml">this site&apos;s sitemap</a>.
        </dd>
        <dt><code>Host</code></dt>
        <dd>A non-standard line some crawlers read as the preferred domain. Most ignore it.</dd>
      </dl>

      <h2 id="why-disallowed">Why these paths are disallowed</h2>
      <ul>
        <li><code>/admin</code> and <code>/dashboard</code> are behind a login. Crawling them only produces redirects to the login page.</li>
        <li><code>/api/auth/</code> handles logins. A crawler has no reason to call it.</li>
        <li><code>/api/rate-limit/strict</code> allows only 5 requests a minute. Real sites often disallow their expensive endpoints like this.</li>
      </ul>

      <h2 id="code">Checking rules in code</h2>
      <p>Python&apos;s standard library has a parser. Check every URL before you fetch it.</p>
      <Code lang="Python">{`
from urllib.robotparser import RobotFileParser

rp = RobotFileParser("https://parseplayground.com/robots.txt")
rp.read()

rp.can_fetch("MyBot", "https://parseplayground.com/products")   # True
rp.can_fetch("MyBot", "https://parseplayground.com/admin")      # False
rp.crawl_delay("MyBot")                                          # 1
rp.crawl_delay("ExampleSlowBot")                                 # 10
rp.can_fetch("ExampleBlockedBot", "https://parseplayground.com/") # False
`}</Code>
      <p className="small text-body-secondary">
        When Allow and Disallow rules overlap, test your parser. Older versions of Python&apos;s parser used the first
        matching rule in the file instead of the longest, which would allow <code>/admin</code> here because{" "}
        <code>Allow: /</code> comes first. <code>protego</code>, the parser Scrapy uses, follows RFC 9309.
      </p>

      <h2 id="limits">What robots.txt doesn&apos;t tell you</h2>
      <p>
        A path that isn&apos;t disallowed isn&apos;t automatically fine to scrape. robots.txt says nothing about how you
        may use the data, and the terms of service can be stricter. Read both.
      </p>
    </GuideLayout>
  );
}
