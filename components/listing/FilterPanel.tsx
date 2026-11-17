import Link from "next/link";

export type FilterField =
  | { type: "select"; name: string; label: string; allLabel: string; options: { value: string; label: string }[] }
  | { type: "range"; label: string; min?: { name: string; placeholder: string }; max?: { name: string; placeholder: string } }
  | { type: "checkbox"; name: string; label: string; value: string; testId?: string };

/**
 * GET form of filters. Works without JavaScript: submitting reloads the page
 * with the filters in the URL. Collapsed behind a "Filters" toggle on small
 * screens, always open on large screens (see .filters-details in globals.css).
 */
export default function FilterPanel({
  basePath,
  params,
  fields,
  sorts,
  activeCount,
}: {
  basePath: string;
  params: Record<string, string>;
  fields: FilterField[];
  sorts?: { value: string; label: string }[];
  activeCount: number;
}) {
  return (
    <details className="filters-details" data-testid="filters-toggle">
      <summary className="btn btn-outline-secondary btn-sm w-100 mb-2">
        Filters{activeCount > 0 && ` (${activeCount})`}
      </summary>
      <form method="get" action={basePath} className="card border-0 shadow-sm" id="filters" data-testid="filters">
        <div className="card-body">
          {params.q && <input type="hidden" name="q" value={params.q} />}
          {sorts && (
            <div className="mb-3">
              <label htmlFor="sort" className="form-label small fw-semibold">Sort by</label>
              <select id="sort" name="sort" className="form-select form-select-sm" defaultValue={params.sort ?? ""} data-testid="sort-select">
                {sorts.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          )}
          {fields.map((f) => {
            if (f.type === "select") {
              return (
                <div className="mb-3" key={f.name}>
                  <label htmlFor={`f-${f.name}`} className="form-label small fw-semibold">{f.label}</label>
                  <select id={`f-${f.name}`} name={f.name} className="form-select form-select-sm" defaultValue={params[f.name] ?? ""} data-testid={`${f.name}-select`}>
                    <option value="">{f.allLabel}</option>
                    {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              );
            }
            if (f.type === "range") {
              return (
                <fieldset className="mb-3" key={f.label}>
                  <legend className="form-label small fw-semibold">{f.label}</legend>
                  <div className="d-flex gap-2">
                    {f.min && (
                      <input type="number" name={f.min.name} min={0} className="form-control form-control-sm" placeholder={f.min.placeholder} aria-label={`${f.label}: ${f.min.placeholder}`} defaultValue={params[f.min.name] ?? ""} data-testid={f.min.name.replace(/_/g, "-")} />
                    )}
                    {f.max && (
                      <input type="number" name={f.max.name} min={0} className="form-control form-control-sm" placeholder={f.max.placeholder} aria-label={`${f.label}: ${f.max.placeholder}`} defaultValue={params[f.max.name] ?? ""} data-testid={f.max.name.replace(/_/g, "-")} />
                    )}
                  </div>
                </fieldset>
              );
            }
            return (
              <div className="form-check mb-3" key={f.name}>
                <input className="form-check-input" type="checkbox" name={f.name} value={f.value} id={`f-${f.name}`} defaultChecked={params[f.name] === f.value} data-testid={f.testId ?? `${f.name}-checkbox`} />
                <label className="form-check-label small" htmlFor={`f-${f.name}`}>{f.label}</label>
              </div>
            );
          })}
          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary btn-sm flex-grow-1" data-testid="apply-filters">Apply</button>
            {activeCount > 0 && <Link href={basePath} className="btn btn-outline-secondary btn-sm" data-testid="clear-filters">Clear</Link>}
          </div>
        </div>
      </form>
    </details>
  );
}
