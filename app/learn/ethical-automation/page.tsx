import type { Metadata } from "next";
import Link from "next/link";
import GuideLayout from "@/components/learn/GuideLayout";
import { guideNav } from "@/lib/learn";

const { guide } = guideNav("ethical-automation");
export const metadata: Metadata = {
  title: guide.title,
  description: guide.summary,
  alternates: { canonical: "/learn/ethical-automation" },
  openGraph: { type: "article", title: guide.title, description: guide.summary },
};

const QUESTIONS = [
  ["Would the owner object if they saw what I'm doing?", "If you think they would, you probably already know the answer. Asking them is often quicker than you expect."],
  ["Am I collecting information about people?", "Names, emails, photos, profiles and reviews are personal data even when they're public. Laws such as the GDPR apply to collecting them, not just to publishing them."],
  ["Am I getting past something meant to keep me out?", "Logins you don't have, paywalls, CAPTCHAs and IP blocks are all signals. Getting around them is where scraping most often becomes unlawful."],
  ["Could my bot hurt the site?", "A small site on cheap hosting can be slowed or taken offline by a scraper a big site wouldn't notice."],
  ["Am I taking the owner's work and passing it off?", "Copying articles, photos or a whole database to republish can infringe copyright or database rights, and it competes with the source."],
  ["Would I be comfortable explaining this publicly?", "If your bot's User-Agent named you, would you still run it the same way?"],
] as const;

export default function EthicsGuide() {
  return (
    <GuideLayout slug="ethical-automation">
      <p>
        Bots now make a large share of all web traffic. Some, like search engine crawlers and price checkers, are welcome.
        Others overload servers, copy content wholesale or harvest personal details. Whether a scraper is one or the other
        depends far more on how it&apos;s used than on how it&apos;s written.
      </p>

      <h2 id="questions">Questions to ask first</h2>
      <ol className="list-unstyled" id="ethics-questions">
        {QUESTIONS.map(([q, a], i) => (
          <li key={q} className="d-flex gap-3 mb-3">
            <span className="fw-bold text-body-secondary">{i + 1}.</span>
            <div><strong>{q}</strong><br /><span className="text-body-secondary">{a}</span></div>
          </li>
        ))}
      </ol>

      <h2 id="personal-data">Personal data</h2>
      <p>
        This is where scraping is most likely to cause real harm. In the EU, the UK and many other places, collecting
        personal data needs a lawful reason, even if the data is public, and you have duties to the people it describes.
        Regulators have fined companies for building databases from scraped photos and profiles.
      </p>
      <ul>
        <li>Collect personal data only if your project truly needs it, and only the fields it needs.</li>
        <li>Drop or anonymise it as early as you can, ideally before you save it.</li>
        <li>Never use scraped contact details to send unsolicited messages.</li>
        <li>Store it securely and delete it when you&apos;re done.</li>
      </ul>
      <p>
        The authors, reviewers and agents on this site are made up, so you can practise extracting this kind of data
        here without these concerns.
      </p>

      <h2 id="access-controls">Logins, CAPTCHAs and blocks</h2>
      <p>
        A login, a CAPTCHA, a paywall or a block is the owner saying &ldquo;not this way&rdquo;. Using your own account to
        automate your own data is usually fine. Sharing accounts, creating fake ones, solving CAPTCHAs automatically or
        changing IP addresses to dodge a block are not. These are also the actions most likely to break laws on computer
        misuse in many countries. If you&apos;re blocked, stop and find out why.
      </p>
      <p>
        This site&apos;s <Link href="/login">login</Link> uses demo accounts that are published for anyone to use, so
        automating it is fine here.
      </p>

      <h2 id="load">Load</h2>
      <p>
        Your scraper&apos;s requests cost the site money and can slow it down for real visitors. Keep to one request at a
        time per site, follow Crawl-delay, cache what you can, and back off on errors. The{" "}
        <Link href="/learn/rate-limits">rate limits guide</Link> shows how.
      </p>

      <h2 id="good-uses">Scraping that does good</h2>
      <p>
        None of this means scraping is suspect. It powers search engines, price comparison, academic research, archiving,
        journalism and accessibility tools. The common thread in good projects is that they take what they need, cause
        little load, respect clear signals from the site owner, and treat people&apos;s data with care.
      </p>

      <p className="small text-body-secondary mt-4">
        This guide is general information, not legal advice. For a real project with legal risk, talk to a lawyer.
      </p>
    </GuideLayout>
  );
}
