import Link from "next/link";
import { buildQuery } from "@/lib/format";

/** Removable chips for the filters currently applied. Each chip links to the same view without that filter. */
export default function ActiveFilters({
  basePath,
  params,
  keys,
  label,
}: {
  basePath: string;
  params: Record<string, string>;
  keys: string[];
  label: (key: string, value: string) => string;
}) {
  if (!keys.length) return null;
  return (
    <div className="mb-3 d-flex flex-wrap gap-2" data-testid="active-filters">
      {keys.map((k) => (
        <Link
          key={k}
          href={`${basePath}${buildQuery(params, { [k]: undefined, page: undefined })}`}
          className="badge rounded-pill text-bg-light border text-decoration-none"
          data-filter={k}
          aria-label={`Remove filter: ${label(k, params[k])}`}
        >
          {label(k, params[k])} ✕
        </Link>
      ))}
    </div>
  );
}
