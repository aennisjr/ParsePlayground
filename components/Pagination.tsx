import Link from "next/link";
import { buildQuery } from "@/lib/format";

/** Numbered pagination with Previous / Next links. Pure links: works without JavaScript. */
export default function Pagination({
  basePath,
  params,
  page,
  totalPages,
}: {
  basePath: string;
  params: Record<string, string>;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;
  const href = (p: number) => `${basePath}${buildQuery(params, { page: p === 1 ? undefined : String(p) })}`;

  // 1 … 4 5 [6] 7 8 … 20
  const pages: (number | "gap")[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 2) pages.push(p);
    else if (pages[pages.length - 1] !== "gap") pages.push("gap");
  }

  return (
    <nav aria-label="Pagination" className="mt-4" data-testid="pagination" data-page={page} data-total-pages={totalPages}>
      <ul className="pagination justify-content-center flex-wrap">
        <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
          {page === 1 ? (
            <span className="page-link">Previous</span>
          ) : (
            <Link className="page-link" href={href(page - 1)} rel="prev" data-testid="pagination-prev">Previous</Link>
          )}
        </li>
        {pages.map((p, i) =>
          p === "gap" ? (
            <li key={`gap-${i}`} className="page-item disabled"><span className="page-link">…</span></li>
          ) : (
            <li key={p} className={`page-item ${p === page ? "active" : ""}`}>
              {p === page ? (
                <span className="page-link" aria-current="page">{p}</span>
              ) : (
                <Link className="page-link" href={href(p)}>{p}</Link>
              )}
            </li>
          ),
        )}
        <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
          {page === totalPages ? (
            <span className="page-link">Next</span>
          ) : (
            <Link className="page-link" href={href(page + 1)} rel="next" data-testid="pagination-next">Next</Link>
          )}
        </li>
      </ul>
    </nav>
  );
}
