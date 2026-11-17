import type { Metadata } from "next";
import GuideLayout, { Code } from "@/components/learn/GuideLayout";
import RateLimitTester from "@/components/learn/RateLimitTester";
import { guideNav } from "@/lib/learn";
import { RATE_LIMITS } from "@/lib/stats";

const { guide } = guideNav("rate-limits");
export const metadata: Metadata = {
  title: guide.title,
  description: guide.summary,
  alternates: { canonical: "/learn/rate-limits" },
  openGraph: { type: "article", title: guide.title, description: guide.summary },
};

export default function RateLimitsGuide() {
  return (
    <GuideLayout slug="rate-limits">
      <p>
        A rate limit caps how many requests a client can make in a period of time. Sites use them to protect their
        servers and share capacity fairly. When you go over, the server usually answers{" "}
        <code>429 Too Many Requests</code> instead of the page you wanted.
      </p>

      <h2 id="endpoints">This site&apos;s demo endpoints</h2>
      <div className="table-responsive">
        <table className="table bg-white shadow-sm small" id="rate-limit-tiers">
          <thead><tr><th scope="col">Endpoint</th><th scope="col">Limit</th><th scope="col">Window</th></tr></thead>
          <tbody>
            {Object.entries(RATE_LIMITS).map(([tier, cfg]) => (
              <tr key={tier}>
                <td><code>/api/rate-limit/{tier}</code></td>
                <td>{cfg ? `${cfg.limit} requests` : "Unlimited"}</td>
                <td>{cfg ? `${cfg.windowSeconds} seconds` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small text-body-secondary">
        Limits are counted per IP address with a fixed window that starts at your first request. Counts are kept in the
        memory of each server instance, so if your requests reach different instances you may get more than the limit
        before seeing a 429.
      </p>

      <RateLimitTester />

      <h2 id="headers">Reading the headers</h2>
      <dl>
        <dt><code>X-RateLimit-Limit</code></dt>
        <dd>How many requests the window allows.</dd>
        <dt><code>X-RateLimit-Remaining</code></dt>
        <dd>How many you have left in the current window. Slow down before it reaches 0, not after.</dd>
        <dt><code>X-RateLimit-Reset</code></dt>
        <dd>
          Seconds until the window resets. Some sites send a Unix timestamp here instead, so check the documentation
          of the site you&apos;re using.
        </dd>
        <dt><code>Retry-After</code></dt>
        <dd>
          Sent with a 429 or 503: how long to wait before trying again, in seconds or as an HTTP date. It&apos;s a
          standard header (RFC 9110), so you should always respect it.
        </dd>
        <dt><code>X-RateLimit-Policy</code></dt>
        <dd>
          The policy in a short form, for example <code>5;w=60</code> for 5 requests per 60 seconds. It&apos;s based on
          an IETF draft that may standardise these headers as <code>RateLimit</code> and <code>RateLimit-Policy</code>.
        </dd>
      </dl>
      <p>
        The <code>X-RateLimit-*</code> names are a convention, not a standard. Many sites send none of them, and the
        first sign of a limit is a 429 or a sudden run of errors.
      </p>

      <h2 id="backoff">Backing off</h2>
      <p>
        When you get a 429, wait for <code>Retry-After</code> if it&apos;s there. If it isn&apos;t, use exponential
        backoff: wait 1 second, then 2, 4, 8 and so on, plus a little randomness so many clients don&apos;t retry at the
        same moment. Give up after a few attempts.
      </p>
      <Code lang="Python">{`
import random
import time
import requests

def get_with_backoff(url, max_attempts=5):
    for attempt in range(max_attempts):
        r = requests.get(url, timeout=30)
        if r.status_code not in (429, 503):
            return r
        retry_after = r.headers.get("Retry-After")
        if retry_after and retry_after.isdigit():
            wait = int(retry_after)
        else:
            wait = 2 ** attempt + random.random()
        print(f"{r.status_code}: waiting {wait:.1f}s")
        time.sleep(wait)
    raise RuntimeError(f"Still rate limited after {max_attempts} attempts")

for i in range(8):
    r = get_with_backoff("https://parseplayground.com/api/rate-limit/strict")
    print(i, r.status_code, r.headers["X-RateLimit-Remaining"])
`}</Code>
      <p>
        Better still, avoid the 429 in the first place. Watch <code>X-RateLimit-Remaining</code> and pause when it gets
        low, or pace requests so you stay under the limit: for 60 requests a minute, send one a second.
      </p>

      <h2 id="dont">What not to do</h2>
      <ul>
        <li>Don&apos;t retry immediately in a loop. Each retry counts against the limit and adds load.</li>
        <li>Don&apos;t rotate IP addresses or accounts to get around a limit. The limit is the owner telling you how much is acceptable.</li>
        <li>Don&apos;t run many parallel workers against one site. Parallelism makes sense across different sites, not within one.</li>
      </ul>
    </GuideLayout>
  );
}
