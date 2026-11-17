"use client";

import { useEffect, useState } from "react";

type Health = { status: string; time: string; commit: string | null; datasets: Record<string, number> };
type Stats = { instanceStartedAt: string; totalRequests: number; byPath: Record<string, number> };
type Snapshot = { health: Health | null; stats: Stats | null; ms: number | null; checkedAt: string; error: string | null };

const POLL_MS = 15_000;

/** Polls /api/health and /api/stats from the visitor's browser. */
export default function LiveStatus() {
  const [snap, setSnap] = useState<Snapshot | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      const start = performance.now();
      try {
        const [h, s] = await Promise.all([
          fetch("/api/health", { cache: "no-store" }),
          fetch("/api/stats", { cache: "no-store" }),
        ]);
        const ms = Math.round(performance.now() - start);
        const health = h.ok ? ((await h.json()) as Health) : null;
        const stats = s.ok ? ((await s.json()) as Stats) : null;
        if (!cancelled) setSnap({ health, stats, ms, checkedAt: new Date().toISOString(), error: h.ok ? null : `Health check returned ${h.status}` });
      } catch {
        if (!cancelled) setSnap({ health: null, stats: null, ms: null, checkedAt: new Date().toISOString(), error: "Could not reach the server" });
      }
    }
    poll();
    const id = setInterval(poll, POLL_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const state = !snap ? "loading" : snap.health?.status === "ok" ? "up" : "down";
  const topPaths = snap?.stats ? Object.entries(snap.stats.byPath).slice(0, 8) : [];

  return (
    <section className="card border-0 shadow-sm" id="live-status" data-testid="live-status" data-state={state} aria-live="polite">
      <div className="card-body">
        <div className="d-flex flex-wrap justify-content-between align-items-baseline gap-2 mb-3">
          <h2 className="h5 mb-0">Right now</h2>
          <span className="small text-body-secondary">
            {snap ? <>Checked from your browser at <time dateTime={snap.checkedAt}>{new Date(snap.checkedAt).toLocaleTimeString()}</time> · refreshes every 15 seconds</> : "Checking…"}
          </span>
        </div>

        {snap?.error && <p className="text-danger small" data-testid="live-error">{snap.error}.</p>}

        <dl className="row small mb-0">
          <dt className="col-sm-4 fw-normal text-body-secondary">API health</dt>
          <dd className="col-sm-8" data-field="health">
            {state === "loading" ? "…" : state === "up" ? <span className="badge text-bg-success">Operational</span> : <span className="badge text-bg-danger">Unavailable</span>}
          </dd>
          <dt className="col-sm-4 fw-normal text-body-secondary">Response time</dt>
          <dd className="col-sm-8" data-field="response-ms">{snap?.ms != null ? `${snap.ms} ms` : "—"}</dd>
          <dt className="col-sm-4 fw-normal text-body-secondary">Deployed commit</dt>
          <dd className="col-sm-8" data-field="commit">{snap?.health?.commit ? <code>{snap.health.commit.slice(0, 7)}</code> : "—"}</dd>
          <dt className="col-sm-4 fw-normal text-body-secondary">Datasets</dt>
          <dd className="col-sm-8" data-field="datasets">
            {snap?.health ? Object.entries(snap.health.datasets).map(([k, v]) => `${v} ${k}`).join(" · ") : "—"}
          </dd>
          <dt className="col-sm-4 fw-normal text-body-secondary">Server instance started</dt>
          <dd className="col-sm-8" data-field="instance-started">
            {snap?.stats ? <time dateTime={snap.stats.instanceStartedAt}>{new Date(snap.stats.instanceStartedAt).toLocaleString()}</time> : "—"}
          </dd>
          <dt className="col-sm-4 fw-normal text-body-secondary">Requests since then</dt>
          <dd className="col-sm-8" data-field="total-requests">{snap?.stats ? snap.stats.totalRequests.toLocaleString() : "—"}</dd>
        </dl>

        {topPaths.length > 0 && (
          <div className="table-responsive mt-3">
            <table className="table table-sm small mb-0" id="top-paths">
              <caption className="caption-top">Most requested API paths on this instance</caption>
              <thead><tr><th scope="col">Path</th><th scope="col" className="text-end">Requests</th></tr></thead>
              <tbody>
                {topPaths.map(([p, n]) => <tr key={p}><td><code>{p}</code></td><td className="text-end">{n.toLocaleString()}</td></tr>)}
              </tbody>
            </table>
          </div>
        )}
        <p className="small text-body-secondary mt-3 mb-0">
          Request counts are kept in the memory of each server instance and reset when it restarts. Your requests may
          reach different instances, so the numbers can jump between refreshes.
        </p>
      </div>
    </section>
  );
}
