"use client";

import { useRef, useState } from "react";

type Tier = "none" | "mild" | "strict";
type Row = { n: number; tier: Tier; status: number; limit: string; remaining: string; reset: string; retryAfter: string; ms: number };

const HEADERS = ["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset", "Retry-After"] as const;

/** Sends real requests to /api/rate-limit/{tier} and tabulates the rate-limit headers. */
export default function RateLimitTester() {
  const [tier, setTier] = useState<Tier>("strict");
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const counter = useRef(0);

  async function send(count: number) {
    setBusy(true);
    try {
      for (let i = 0; i < count; i++) {
        const start = performance.now();
        let row: Row;
        try {
          const r = await fetch(`/api/rate-limit/${tier}`, { cache: "no-store" });
          const [limit, remaining, reset, retryAfter] = HEADERS.map((h) => r.headers.get(h) ?? "—");
          row = { n: ++counter.current, tier, status: r.status, limit, remaining, reset, retryAfter, ms: Math.round(performance.now() - start) };
        } catch {
          row = { n: ++counter.current, tier, status: 0, limit: "—", remaining: "—", reset: "—", retryAfter: "—", ms: Math.round(performance.now() - start) };
        }
        setRows((prev) => [row, ...prev].slice(0, 30));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card border-0 shadow-sm my-4" data-testid="rate-limit-tester">
      <div className="card-body">
        <h3 className="h6 mb-3">Try it</h3>
        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
          <label htmlFor="tier" className="small text-body-secondary">Endpoint</label>
          <select id="tier" className="form-select form-select-sm w-auto" value={tier} onChange={(e) => setTier(e.target.value as Tier)} disabled={busy}>
            <option value="none">none — unlimited</option>
            <option value="mild">mild — 60 per minute</option>
            <option value="strict">strict — 5 per minute</option>
          </select>
          <button type="button" className="btn btn-dark btn-sm" onClick={() => send(1)} disabled={busy}>Send 1 request</button>
          <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => send(8)} disabled={busy}>Send 8 in a row</button>
          {rows.length > 0 && (
            <button type="button" className="btn btn-link btn-sm" onClick={() => setRows([])} disabled={busy}>Clear</button>
          )}
        </div>
        <div className="table-responsive">
          <table className="table table-sm small mb-0 align-middle" id="rate-limit-log" aria-live="polite">
            <thead>
              <tr>
                <th scope="col">#</th><th scope="col">Endpoint</th><th scope="col">Status</th>
                <th scope="col">Limit</th><th scope="col">Remaining</th><th scope="col">Reset (s)</th><th scope="col">Retry-After</th>
                <th scope="col" className="text-end">Time</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={8} className="text-body-secondary text-center py-3">No requests yet. Pick “strict” and send 8 to see a 429.</td></tr>
              )}
              {rows.map((r) => (
                <tr key={r.n} data-status={r.status}>
                  <td>{r.n}</td>
                  <td><code>/api/rate-limit/{r.tier}</code></td>
                  <td>
                    <span className={`badge ${r.status === 200 ? "text-bg-success" : r.status === 429 ? "text-bg-warning" : "text-bg-danger"}`}>
                      {r.status || "network error"}
                    </span>
                  </td>
                  <td>{r.limit}</td><td>{r.remaining}</td><td>{r.reset}</td><td>{r.retryAfter}</td>
                  <td className="text-end">{r.ms} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
