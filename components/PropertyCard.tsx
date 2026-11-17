import Link from "next/link";
import type { Property } from "@/lib/data";
import { formatMoney } from "@/lib/format";

export function PropertyImage({ type, large = false }: { type: string; large?: boolean }) {
  const icon = type === "Apartment" || type === "Studio" || type === "Penthouse" ? "🏢" : "🏡";
  const hue = { Apartment: 200, Studio: 180, Penthouse: 250, "Terraced House": 20, "Semi-Detached House": 140, "Detached House": 95 }[type] ?? 200;
  return (
    <div
      role="img"
      aria-label={type}
      className="d-flex align-items-center justify-content-center"
      style={{ aspectRatio: large ? "16 / 9" : "4 / 3", background: `linear-gradient(135deg, hsl(${hue} 60% 90%), hsl(${hue} 45% 76%))`, fontSize: large ? "6rem" : "3rem" }}
    >
      <span aria-hidden="true">{icon}</span>
    </div>
  );
}

export function PropertyPrice({ p, className = "" }: { p: Property; className?: string }) {
  return (
    <span className={`price ${className}`} data-price={p.price} data-currency={p.currency} data-period={p.pricePeriod ?? "total"}>
      {formatMoney(p.price, p.currency)}
      {p.pricePeriod && <span className="small fw-normal text-body-secondary"> / {p.pricePeriod}</span>}
    </span>
  );
}

export default function PropertyCard({ property: p }: { property: Property }) {
  return (
    <article className="card h-100 border-0 shadow-sm feature-card property-card overflow-hidden" data-testid="property-card" data-property-id={p.id} data-listing-type={p.listingType}>
      <div className="position-relative">
        <PropertyImage type={p.propertyType} />
        <span className={`badge position-absolute top-0 start-0 m-2 ${p.listingType === "rent" ? "text-bg-warning" : "text-bg-dark"} listing-type`}>
          {p.listingType === "rent" ? "To rent" : "For sale"}
        </span>
      </div>
      <div className="card-body">
        <div className="fw-bold fs-5 mb-1"><PropertyPrice p={p} /></div>
        <h2 className="h6 mb-1">
          <Link href={`/real-estate/${p.slug}`} className="property-title stretched-link text-body text-decoration-none">{p.title}</Link>
        </h2>
        <address className="small text-body-secondary mb-2 address">{p.address.street}, {p.city}</address>
        <ul className="list-inline small mb-0 specs">
          <li className="list-inline-item beds" data-beds={p.bedrooms}>{p.bedrooms ? `${p.bedrooms} bed` : "Studio"}</li>
          <li className="list-inline-item baths" data-baths={p.bathrooms}>· {p.bathrooms} bath</li>
          <li className="list-inline-item area" data-sqm={p.areaSqm}>· {p.areaSqm} m²</li>
        </ul>
      </div>
    </article>
  );
}
