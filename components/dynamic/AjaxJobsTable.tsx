"use client";

import { useEffect, useState } from "react";
import type { Job } from "@/lib/data";

type JobRow = Pick<Job, "id" | "slug" | "title" | "company" | "city" | "remote" | "salaryMin" | "salaryMax" | "salaryCurrency">;

/**
 * Classic AJAX: XMLHttpRequest after the page loads. The server-rendered
 * HTML contains only a "Loading…" row.
 */
export default function AjaxJobsTable({ delayMs }: { delayMs: number }) {
  const [rows, setRows] = useState<JobRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `/api/jobs?sort=-salaryMax&limit=15&delay=${delayMs}`);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhr.onload = () => {
      if (xhr.status !== 200) return setError(`Request failed with status ${xhr.status}`);
      setRows((JSON.parse(xhr.responseText) as { data: JobRow[] }).data);
    };
    xhr.onerror = () => setError("Network error");
    xhr.send();
    return () => xhr.abort();
  }, [delayMs, attempt]);

  const money = (n: number, c: string) => n.toLocaleString("en-US", { style: "currency", currency: c, maximumFractionDigits: 0 });

  return (
    <div className="table-responsive">
      <table className="table bg-white shadow-sm align-middle" id="jobs-table" data-testid="jobs-table" data-state={rows ? "loaded" : error ? "error" : "loading"} aria-busy={!rows && !error}>
        <thead>
          <tr><th scope="col">Job</th><th scope="col">Company</th><th scope="col">Location</th><th scope="col">Workplace</th><th scope="col" className="text-end">Top of range</th></tr>
        </thead>
        <tbody>
          {!rows && !error && (
            <tr data-testid="loading-row">
              <td colSpan={5} className="text-center text-body-secondary py-4">
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />Loading jobs…
              </td>
            </tr>
          )}
          {error && (
            <tr data-testid="error-row">
              <td colSpan={5} className="text-center text-danger py-4">
                {error}.{" "}
                <button type="button" className="btn btn-link btn-sm p-0 align-baseline" onClick={() => { setError(null); setAttempt((a) => a + 1); }}>Retry</button>
              </td>
            </tr>
          )}
          {rows?.map((j) => (
            <tr key={j.id} data-job-id={j.id}>
              <td className="title"><a href={`/jobs/${j.slug}`}>{j.title}</a></td>
              <td className="company">{j.company}</td>
              <td className="city">{j.city}</td>
              <td className="workplace">{j.remote}</td>
              <td className="salary text-end text-nowrap" data-value={j.salaryMax} data-currency={j.salaryCurrency}>{money(j.salaryMax, j.salaryCurrency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
