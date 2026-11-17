import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DATASETS } from "@/lib/data";
import { formatDate, formatMoney } from "@/lib/format";
import { absoluteUrl } from "@/lib/site";
import Breadcrumbs from "@/components/Breadcrumbs";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;
export function generateStaticParams() {
  return DATASETS.jobs.map((j) => ({ slug: j.slug }));
}

const findBySlug = (slug: string) => DATASETS.jobs.find((j) => j.slug === slug);
const SCHEMA_EMPLOYMENT: Record<string, string> = { "Full-time": "FULL_TIME", "Part-time": "PART_TIME", Contract: "CONTRACTOR" };

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const j = findBySlug((await params).slug);
  if (!j) return {};
  const title = `${j.title} at ${j.company}`;
  return {
    title,
    description: `${j.title} at ${j.company} in ${j.location}. ${j.remote}, ${j.employmentType.toLowerCase()}.`,
    alternates: { canonical: `/jobs/${j.slug}` },
    openGraph: { title, url: `/jobs/${j.slug}` },
  };
}

export default async function JobPage({ params }: { params: Params }) {
  const j = findBySlug((await params).slug);
  if (!j) notFound();

  const sameCompany = DATASETS.jobs.filter((o) => o.company === j.company && o.id !== j.id).slice(0, 5);
  const jobLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: j.title,
    description: [j.description, ...j.responsibilities, ...j.requirements].join(" "),
    identifier: { "@type": "PropertyValue", name: j.company, value: String(j.id) },
    datePosted: j.postedAt.slice(0, 10),
    employmentType: SCHEMA_EMPLOYMENT[j.employmentType],
    hiringOrganization: { "@type": "Organization", name: j.company },
    jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: j.city, addressCountry: j.country } },
    ...(j.remote === "Remote" && { jobLocationType: "TELECOMMUTE" }),
    baseSalary: {
      "@type": "MonetaryAmount",
      currency: j.salaryCurrency,
      value: { "@type": "QuantitativeValue", minValue: j.salaryMin, maxValue: j.salaryMax, unitText: "YEAR" },
    },
    skills: j.tags.join(", "),
    url: absoluteUrl(`/jobs/${j.slug}`),
  };

  return (
    <div className="container py-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobLd) }} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Jobs", href: "/jobs" }, { label: j.title, href: `/jobs/${j.slug}` }]} />

      <div className="row g-4 g-lg-5" id="job" data-job-id={j.id}>
        <div className="col-lg-8">
          <h1 className="h2 job-title">{j.title}</h1>
          <p className="mb-3">
            <Link href={`/jobs?company=${encodeURIComponent(j.company)}`} className="company fw-semibold">{j.company}</Link> ·{" "}
            <Link href={`/jobs?city=${encodeURIComponent(j.city)}`} className="location">{j.location}</Link>
          </p>
          <p className="lead fs-6">{j.description}</p>

          <h2 className="h5 mt-4">What you&apos;ll do</h2>
          <ul id="responsibilities">{j.responsibilities.map((r) => <li key={r}>{r}</li>)}</ul>

          <h2 className="h5 mt-4">What we&apos;re looking for</h2>
          <ul id="requirements">{j.requirements.map((r) => <li key={r}>{r}</li>)}</ul>

          <h2 className="h5 mt-4">Benefits</h2>
          <ul id="benefits">{j.benefits.map((b) => <li key={b}>{b}</li>)}</ul>
        </div>

        <aside className="col-lg-4">
          <div className="card border-0 shadow-sm" data-testid="job-summary">
            <div className="card-body">
              <dl className="mb-3 small" id="job-facts">
                <dt className="text-body-secondary fw-normal">Salary</dt>
                <dd className="fw-semibold fs-5 salary" data-min={j.salaryMin} data-max={j.salaryMax} data-currency={j.salaryCurrency}>
                  {formatMoney(j.salaryMin, j.salaryCurrency)} – {formatMoney(j.salaryMax, j.salaryCurrency)}
                  <span className="small fw-normal text-body-secondary"> / year</span>
                </dd>
                <dt className="text-body-secondary fw-normal">Workplace</dt>
                <dd className="workplace">{j.remote}</dd>
                <dt className="text-body-secondary fw-normal">Job type</dt>
                <dd className="employment-type">{j.employmentType}</dd>
                <dt className="text-body-secondary fw-normal">Experience</dt>
                <dd className="experience" data-years={j.experienceYears}>{j.experienceYears ? `${j.experienceYears}+ years` : "Entry level"}</dd>
                <dt className="text-body-secondary fw-normal">Posted</dt>
                <dd className="mb-0"><time dateTime={j.postedAt} className="posted">{formatDate(j.postedAt)}</time></dd>
              </dl>
              <div className="d-flex flex-wrap gap-1 mb-3">
                {j.tags.map((t) => <Link key={t} href={`/jobs?tag=${t}`} className="badge text-bg-light border text-decoration-none tag">{t}</Link>)}
              </div>
              <button type="button" className="btn btn-primary w-100" data-testid="apply-button">Apply for this job</button>
              <p className="small text-body-secondary mt-2 mb-0">Data: <a href={`/api/jobs/${j.id}`}>JSON</a> · <a href={`/api/jobs/${j.id}?format=xml`}>XML</a></p>
            </div>
          </div>

          {sameCompany.length > 0 && (
            <div className="mt-4" data-testid="more-from-company">
              <h2 className="h6">More jobs at {j.company}</h2>
              <ul className="list-unstyled small">
                {sameCompany.map((o) => (
                  <li key={o.id} className="mb-1"><Link href={`/jobs/${o.slug}`}>{o.title}</Link> <span className="text-body-secondary">· {o.city}</span></li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
