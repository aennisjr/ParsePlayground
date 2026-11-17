/** Star rating. The numeric value is in a data attribute and visually-hidden text for scrapers and screen readers. */
export default function Rating({ value, count }: { value: number | null; count?: number }) {
  if (value == null) return <span className="small text-body-secondary" data-rating="none">No reviews yet</span>;
  const full = Math.round(value);
  return (
    <span className="rating small" data-rating={value}>
      <span className="text-warning" aria-hidden="true">{"★".repeat(full)}{"☆".repeat(5 - full)}</span>
      <span className="visually-hidden">Rated {value} out of 5</span>
      {count !== undefined && <span className="text-body-secondary ms-1">({count})</span>}
    </span>
  );
}
