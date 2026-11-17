import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import LiveStatus from "@/components/status/LiveStatus";
import { loadChecks, summarise, UPTIME_DATA_URL, type DaySummary } from "@/lib/uptime";

export const metadata: Metadata = {
  title: "Status",
  description: "Live health, uptime history and request statistics for ParsePlayground.",
  alternates: { canonical: "/status" },
};

// Rebuilt at most every 5 minutes, matching the uptime check interval.
export const revalidate = 300;

const fmtPct = (p: number | null) => (p === null ? "No data" : `${p >= 99.995 ? "100" : p.toFixed(2)}%`);
const fmtTime = (iso: string) => new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) + " UTC";

function dayClass(d: DaySummary) {
  if (d.uptime === null) return "day-none";
  if (d.failures === 0) return "day-ok";
  return d.uptime >= 95 ? "day-partial" : "day-down";
}

export default async function StatusPage() {
  const checks = await loadChecks();
  const s = checks ? summarise(checks) : null;
  const overall = !s?.latest ? "unknown" : s.latest.ok ? "up" : "down";
  const recent = s ? s.checks.slice(-20).reverse() : [];

  return (
    <div className="container py-4">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Status", href: "/status" }]} />
      <h1 className="h3">Status</h1>

      <div className={`status-banner status-${overall} rounded-3 p-4 my-3`} data-testid="status-banner" data-state={overall}>
        <p className="h5 mb-1">
          {overall === "up" ? "All systems operational" : overall === "down" ? "The last check failed" : "Uptime history unavailable"}
        </p>
        <p className="small mb-0 opacity-75">
          {s?.latest
            ? <>Last checked <time dateTime={s.latest.time}>{fmtTime(s.latest.time)}</time>: HTTP {s.latest.status} in {s.latest.ms} ms.</>
            : "The uptime history couldn't be loaded. The live check below still works."}
        </p>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          {s && (
            <section className="card border-0 shadow-sm mb-4" aria-labelledby="uptime-heading">
              <div className="card-body">
                <h2 className="h5" id="uptime-heading">Uptime</h2>
                <div className="row row-cols-2 row-cols-md-4 g-3 my-1" id="uptime-summary">
                  {s.uptime.map((u) => (
                    <div className="col" key={u.label} data-window={u.label}>
                      <div className="small text-body-secondary">{u.label}</div>
                      <div className="fs-5 fw-semibold">{fmtPct(u.pct)}</div>
                      <div className="small text-body-secondary">{u.checks.toLocaleString()} checks</div>
                    </div>
                  ))}
                  <div className="col" data-window="latency">
                    <div className="small text-body-secondary">Response, 24 hours</div>
                    <div className="fs-5 fw-semibold">{s.avgMs !== null ? `${s.avgMs} ms` : "—"}</div>
                    <div className="small text-body-secondary">{s.p95Ms !== null ? `95th percentile ${s.p95Ms} ms` : "average"}</div>
                  </div>
                </div>

                <h3 className="h6 mt-4">Last 30 days</h3>
                <ol className="uptime-bars list-unstyled d-flex gap-1 mb-1" id="uptime-days" aria-label="Daily uptime, oldest first">
                  {s.days.map((d) => (
                    <li
                      key={d.date}
                      className={`flex-fill rounded-1 ${dayClass(d)}`}
                      data-date={d.date}
                      data-checks={d.checks}
                      data-failures={d.failures}
                      title={`${d.date}: ${d.checks ? `${fmtPct(d.uptime)} of ${d.checks} checks` : "no checks"}`}
                    >
                      <span className="visually-hidden">{d.date}: {d.checks ? `${fmtPct(d.uptime)}, ${d.failures} failed of ${d.checks}` : "no data"}</span>
                    </li>
                  ))}
                </ol>
                <div className="d-flex justify-content-between small text-body-secondary">
                  <span>30 days ago</span><span>Today</span>
                </div>
              </div>
            </section>
          )}

          {recent.length > 0 && (
            <section className="card border-0 shadow-sm" aria-labelledby="recent-heading">
              <div className="card-body">
                <h2 className="h5" id="recent-heading">Recent checks</h2>
                <div className="table-responsive">
                  <table className="table table-sm small mb-0 align-middle" id="recent-checks">
                    <thead><tr><th scope="col">Time (UTC)</th><th scope="col">Result</th><th scope="col">HTTP status</th><th scope="col" className="text-end">Response</th></tr></thead>
                    <tbody>
                      {recent.map((c) => (
                        <tr key={c.time} data-ok={c.ok}>
                          <td><time dateTime={c.time}>{fmtTime(c.time).replace(" UTC", "")}</time></td>
                          <td><span className={`badge ${c.ok ? "text-bg-success" : "text-bg-danger"}`}>{c.ok ? "Up" : "Down"}</span></td>
                          <td>{c.status || "No response"}</td>
                          <td className="text-end">{c.ms} ms</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
        </div>

        <div className="col-lg-5">
          <LiveStatus />
          <section className="mt-4 small text-body-secondary" aria-labelledby="how-heading">
            <h2 className="h6 text-body" id="how-heading">How this works</h2>
            <p>
              A scheduled GitHub Actions workflow requests <a href="/api/health">/api/health</a> about every 5 minutes and
              appends the result to a <a href={UPTIME_DATA_URL}>JSON file</a> in this site&apos;s public repository. GitHub
              sometimes runs scheduled jobs late or skips them when it&apos;s busy, so there can be gaps between checks.
              This page reads that file and is rebuilt at most every 5 minutes.
            </p>
            <p className="mb-0">
              The &ldquo;Right now&rdquo; panel calls <a href="/api/health">/api/health</a> and{" "}
              <a href="/api/stats">/api/stats</a> from your browser. Both are public, so you can monitor them from your own
              scripts too.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
