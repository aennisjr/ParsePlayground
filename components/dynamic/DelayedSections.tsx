"use client";

import { useEffect, useState } from "react";

/**
 * Content that appears or changes on timers after the page loads:
 * - three panels revealed at 1 s, 3 s and 5 s
 * - a price that shows a placeholder, then a "final" value at 2 s, then a sale price at 4 s
 * - a status element whose class and text change at 2.5 s
 * - one element that never appears (to practise timeouts)
 * All timings start when the page has loaded in the browser.
 */
export default function DelayedSections({ stats }: { stats: { label: string; value: string; key: string }[] }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const id = setInterval(() => {
      const ms = performance.now() - start;
      setElapsed(ms);
      if (ms > 6000) clearInterval(id);
    }, 100);
    return () => clearInterval(id);
  }, []);

  const panels = [
    { at: 1000, ...stats[0] },
    { at: 3000, ...stats[1] },
    { at: 5000, ...stats[2] },
  ];
  const price = elapsed < 2000 ? null : elapsed < 4000 ? 249.99 : 199.99;
  const ready = elapsed >= 2500;

  return (
    <div data-testid="delayed-root">
      <p className="small text-body-secondary" aria-live="off">
        Time since load: <span data-testid="elapsed">{(elapsed / 1000).toFixed(1)}</span>s
      </p>

      <h2 className="h5 mt-4">1. Panels that appear one by one</h2>
      <div className="row g-3">
        {panels.map((p) => (
          <div className="col-md-4" key={p.key}>
            {elapsed >= p.at ? (
              <div className="card border-0 shadow-sm h-100 delayed-panel" data-testid={`panel-${p.key}`} data-appeared-after-ms={p.at}>
                <div className="card-body">
                  <div className="small text-body-secondary">{p.label}</div>
                  <div className="fs-3 fw-bold value">{p.value}</div>
                  <div className="small text-body-secondary">Appeared after {p.at / 1000}s</div>
                </div>
              </div>
            ) : (
              <div className="card border-0 h-100 placeholder-glow" aria-hidden="true">
                <div className="card-body">
                  <span className="placeholder col-6 mb-2" />
                  <span className="placeholder col-4 placeholder-lg" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <h2 className="h5 mt-5">2. A value that changes after it appears</h2>
      <p className="small text-body-secondary mb-2">
        The price shows a placeholder, then <strong>$249.99</strong> at 2s, then drops to the sale price <strong>$199.99</strong> at 4s.
        A scraper that reads too early gets the wrong number.
      </p>
      <div className="fs-2 fw-bold" data-testid="changing-price" data-price={price ?? ""} data-final={elapsed >= 4000 ? "true" : "false"}>
        {price === null ? <span className="text-body-secondary">—</span> : price.toLocaleString("en-US", { style: "currency", currency: "USD" })}
        {elapsed >= 4000 && <span className="badge text-bg-danger fs-6 ms-2 align-middle">Sale</span>}
      </div>

      <h2 className="h5 mt-5">3. An element whose state changes</h2>
      <div
        className={`alert ${ready ? "alert-success status-ready" : "alert-secondary status-pending"} d-inline-block`}
        data-testid="status"
        data-status={ready ? "ready" : "pending"}
        role="status"
      >
        {ready ? "Report ready — 3 files generated" : "Generating report…"}
      </div>

      <h2 className="h5 mt-5">4. An element that never appears</h2>
      <p className="small text-body-secondary mb-0">
        Wait for <code>[data-testid=&quot;never-appears&quot;]</code> and make sure your script times out cleanly instead of hanging.
      </p>
    </div>
  );
}
