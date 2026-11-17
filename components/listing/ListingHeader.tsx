/** Page title, "Showing X–Y of Z" summary and a search box that keeps the other filters. */
export default function ListingHeader({
  title,
  basePath,
  params,
  total,
  first,
  last,
  noun,
  searchPlaceholder,
}: {
  title: string;
  basePath: string;
  params: Record<string, string>;
  total: number;
  first: number;
  last: number;
  noun: string;
  searchPlaceholder: string;
}) {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3">
      <div>
        <h1 className="h3 mb-1">{title}</h1>
        <p className="text-body-secondary small mb-0" data-testid="result-count" data-total={total}>
          {total ? `Showing ${first}–${last} of ${total} ${noun}` : `No ${noun} match your filters`}
        </p>
      </div>
      <form method="get" action={basePath} className="d-flex gap-2" role="search" data-testid="search-form">
        {Object.entries(params)
          .filter(([k]) => k !== "q" && k !== "page")
          .map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
        <input type="search" name="q" defaultValue={params.q ?? ""} className="form-control" placeholder={searchPlaceholder} aria-label={searchPlaceholder} data-testid="search-input" />
        <button className="btn btn-dark" type="submit">Search</button>
      </form>
    </div>
  );
}
