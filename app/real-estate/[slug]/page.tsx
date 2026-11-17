import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DATASETS } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { absoluteUrl } from "@/lib/site";
import Breadcrumbs from "@/components/Breadcrumbs";
import PropertyCard, { PropertyImage, PropertyPrice } from "@/components/PropertyCard";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;
export function generateStaticParams() {
  return DATASETS["real-estate"].map((p) => ({ slug: p.slug }));
}

const findBySlug = (slug: string) => DATASETS["real-estate"].find((p) => p.slug === slug);

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = findBySlug((await params).slug);
  if (!p) return {};
  const title = `${p.title} — ${p.listingType === "rent" ? "To rent" : "For sale"}`;
  return {
    title,
    description: p.description,
    alternates: { canonical: `/real-estate/${p.slug}` },
    openGraph: { title, description: p.description, url: `/real-estate/${p.slug}` },
  };
}

export default async function PropertyPage({ params }: { params: Params }) {
  const p = findBySlug((await params).slug);
  if (!p) notFound();

  const similar = DATASETS["real-estate"]
    .filter((o) => o.city === p.city && o.listingType === p.listingType && o.id !== p.id)
    .slice(0, 3);
  const url = absoluteUrl(`/real-estate/${p.slug}`);
  const listingLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: p.title,
    description: p.description,
    url,
    datePosted: p.listedAt.slice(0, 10),
    offers: {
      "@type": "Offer",
      price: p.price,
      priceCurrency: p.currency,
      businessFunction: p.listingType === "rent" ? "http://purl.org/goodrelations/v1#LeaseOut" : "http://purl.org/goodrelations/v1#Sell",
      ...(p.pricePeriod && { priceSpecification: { "@type": "UnitPriceSpecification", price: p.price, priceCurrency: p.currency, unitCode: "MON" } }),
      seller: { "@type": "RealEstateAgent", name: p.agent },
    },
    about: {
      "@type": p.propertyType.includes("House") ? "SingleFamilyResidence" : "Apartment",
      numberOfBedrooms: p.bedrooms,
      numberOfBathroomsTotal: p.bathrooms,
      floorSize: { "@type": "QuantitativeValue", value: p.areaSqm, unitCode: "MTK" },
      amenityFeature: p.features.map((f) => ({ "@type": "LocationFeatureSpecification", name: f, value: true })),
      address: { "@type": "PostalAddress", streetAddress: p.address.street, addressLocality: p.city, postalCode: p.address.postcode, addressCountry: p.country },
    },
  };

  return (
    <div className="container py-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listingLd) }} />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Real estate", href: "/real-estate" },
          { label: p.city, href: `/real-estate?city=${encodeURIComponent(p.city)}` },
          { label: p.title, href: `/real-estate/${p.slug}` },
        ]}
      />

      <div className="row g-4 g-lg-5" id="property" data-property-id={p.id} data-listing-type={p.listingType}>
        <div className="col-lg-8">
          <div className="rounded overflow-hidden shadow-sm mb-4"><PropertyImage type={p.propertyType} large /></div>
          <span className={`badge ${p.listingType === "rent" ? "text-bg-warning" : "text-bg-dark"} mb-2 listing-type`}>{p.listingType === "rent" ? "To rent" : "For sale"}</span>
          <h1 className="h2 property-title">{p.title}</h1>
          <address className="text-body-secondary address" itemScope itemType="https://schema.org/PostalAddress">
            <span itemProp="streetAddress" className="street">{p.address.street}</span>,{" "}
            <span itemProp="addressLocality" className="city">{p.city}</span>{" "}
            <span itemProp="postalCode" className="postcode">{p.address.postcode}</span>,{" "}
            <span itemProp="addressCountry" className="country">{p.country}</span>
          </address>
          <p className="lead fs-6 description">{p.description}</p>

          <h2 className="h5 mt-4">Key facts</h2>
          <div className="table-responsive">
            <table className="table table-sm bg-white shadow-sm" id="property-facts" data-testid="property-facts">
              <tbody>
                <tr><th scope="row" className="fw-normal text-body-secondary w-50">Property type</th><td>{p.propertyType}</td></tr>
                <tr><th scope="row" className="fw-normal text-body-secondary">Bedrooms</th><td data-value={p.bedrooms}>{p.bedrooms || "Studio"}</td></tr>
                <tr><th scope="row" className="fw-normal text-body-secondary">Bathrooms</th><td data-value={p.bathrooms}>{p.bathrooms}</td></tr>
                <tr><th scope="row" className="fw-normal text-body-secondary">Floor area</th><td data-value={p.areaSqm}>{p.areaSqm} m² ({Math.round(p.areaSqm * 10.7639).toLocaleString("en-US")} sq ft)</td></tr>
                <tr><th scope="row" className="fw-normal text-body-secondary">Listed</th><td><time dateTime={p.listedAt}>{formatDate(p.listedAt)}</time></td></tr>
                <tr><th scope="row" className="fw-normal text-body-secondary">Reference</th><td className="reference">PP-RE-{String(p.id).padStart(4, "0")}</td></tr>
              </tbody>
            </table>
          </div>

          <h2 className="h5 mt-4">Features</h2>
          <ul className="list-unstyled row row-cols-2 small" id="features">
            {p.features.map((f) => <li key={f} className="col mb-1 feature">✓ {f}</li>)}
          </ul>
        </div>

        <aside className="col-lg-4">
          <div className="card border-0 shadow-sm" data-testid="price-card">
            <div className="card-body">
              <div className="fs-3 fw-bold mb-1"><PropertyPrice p={p} /></div>
              {p.listingType === "sale" && (
                <p className="small text-body-secondary" data-testid="price-per-sqm">
                  {Math.round(p.price / p.areaSqm).toLocaleString("en-US")} {p.currency} per m²
                </p>
              )}
              <hr />
              <div className="small text-body-secondary">Marketed by</div>
              <div className="fw-semibold mb-3 agent">{p.agent}</div>
              <button type="button" className="btn btn-primary w-100" data-testid="contact-agent">Contact agent</button>
            </div>
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-5" aria-labelledby="similar-heading" data-testid="similar-properties">
          <h2 className="h4" id="similar-heading">Similar properties in {p.city}</h2>
          <div className="row row-cols-1 row-cols-md-3 g-3">
            {similar.map((s) => <div className="col" key={s.id}><PropertyCard property={s} /></div>)}
          </div>
        </section>
      )}
      <p className="small text-body-secondary mt-4 mb-0">
        Data for this listing: <a href={`/api/real-estate/${p.id}`}>JSON</a> · <a href={`/api/real-estate/${p.id}?format=xml`}>XML</a>
      </p>
    </div>
  );
}
