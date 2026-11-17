import type { Metadata } from "next";
import Link from "next/link";
import GuideLayout from "@/components/learn/GuideLayout";
import { guideNav } from "@/lib/learn";
import { SITE_NAME } from "@/lib/site";

const { guide } = guideNav("terms-of-service");
export const metadata: Metadata = {
  title: guide.title,
  description: guide.summary,
  alternates: { canonical: "/learn/terms-of-service" },
  openGraph: { type: "article", title: guide.title, description: guide.summary },
};

export default function TermsGuide() {
  return (
    <GuideLayout slug="terms-of-service">
      <p>
        A site&apos;s terms of service (also called terms of use or terms and conditions) are the rules the owner sets
        for using it. robots.txt is aimed at crawlers. The terms are aimed at people and the businesses they work for,
        and they often go further: they can forbid automated access altogether, or limit what you can do with the data.
      </p>

      <h2 id="where">Where to find them</h2>
      <p>
        Usually in the footer, as &ldquo;Terms&rdquo;, &ldquo;Terms of use&rdquo; or &ldquo;Legal&rdquo;. Try{" "}
        <code>/terms</code> or <code>/legal</code>. If a site has an API, its API terms are often separate and more
        specific.
      </p>

      <h2 id="what-to-look-for">What to look for</h2>
      <ul>
        <li><strong>Automated access.</strong> Search for &ldquo;automated&rdquo;, &ldquo;robot&rdquo;, &ldquo;spider&rdquo;, &ldquo;scrape&rdquo; and &ldquo;crawl&rdquo;. Some terms forbid all automated access. Some allow it within limits, or only for search engines.</li>
        <li><strong>Use of the content.</strong> Can you store it, analyse it, republish it, or use it commercially? Many terms allow personal use only.</li>
        <li><strong>Accounts.</strong> Anything that requires logging in means you accepted the terms when you signed up, which makes them more clearly binding.</li>
        <li><strong>Limits and fair use.</strong> Some terms state a request rate or say you mustn&apos;t put an unreasonable load on the service.</li>
        <li><strong>Personal data.</strong> Rules about collecting information on other users, such as names, profiles and contact details.</li>
        <li><strong>An official alternative.</strong> Terms that forbid scraping often point to an API or a licensing route.</li>
      </ul>

      <h2 id="binding">Do they bind you?</h2>
      <p>
        It depends on the country and on how you came to the terms. Terms you clicked to accept when creating an
        account are generally treated more seriously than a link in a footer that you never opened. Courts have reached
        different conclusions in different cases, and the position keeps changing. The safe approach is simple: if the
        terms forbid what you plan to do, don&apos;t do it without permission. Ask the owner, or use their API.
      </p>
      <p className="small text-body-secondary">This is general information, not legal advice.</p>

      <h2 id="this-site">This site&apos;s terms</h2>
      <div className="card border-0 shadow-sm" id="site-terms" data-testid="site-terms">
        <div className="card-body">
          <p>{SITE_NAME} exists to be scraped. You may:</p>
          <ul>
            <li>scrape, crawl and automate any public page and API endpoint, by hand or with any tool</li>
            <li>log in with the demo accounts and automate the logged-in pages</li>
            <li>use the content in tutorials, courses, tests and demos, including commercial ones</li>
          </ul>
          <p>In return:</p>
          <ul>
            <li>follow <a href="/robots.txt">robots.txt</a> and back off when you get a 429</li>
            <li>don&apos;t run load or denial-of-service tests, and keep to a modest request rate</li>
            <li>don&apos;t try to break into the site or its hosting; the security controls here are for practice, not to be attacked</li>
          </ul>
          <p className="mb-0 small text-body-secondary">
            All products, people, companies, jobs and properties on this site are made up. Any resemblance to real ones
            is a coincidence. The data is provided as is, with no guarantee of accuracy or availability.
          </p>
        </div>
      </div>
      <p className="mt-4">
        Next, the <Link href="/learn/ethical-automation">ethical automation guide</Link> covers the questions terms of
        service often don&apos;t answer.
      </p>
    </GuideLayout>
  );
}
