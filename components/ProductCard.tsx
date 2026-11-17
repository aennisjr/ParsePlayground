import Link from "next/link";
import type { Product } from "@/lib/data";
import { formatMoney } from "@/lib/format";
import ProductImage from "./ProductImage";
import Rating from "./Rating";

export default function ProductCard({ product: p }: { product: Product }) {
  return (
    <article
      className="card h-100 border-0 shadow-sm product-card feature-card"
      data-testid="product-card"
      data-product-id={p.id}
      data-sku={p.sku}
      itemScope
      itemType="https://schema.org/Product"
    >
      <Link href={`/products/${p.slug}`} className="text-decoration-none">
        <ProductImage name={p.name} category={p.category} />
      </Link>
      <div className="card-body d-flex flex-column">
        <div className="small text-body-secondary mb-1">
          <span className="brand" itemProp="brand">{p.brand}</span> · <span className="category">{p.category}</span>
        </div>
        <h3 className="h6 card-title mb-2">
          <Link href={`/products/${p.slug}`} className="product-name stretched-link text-body text-decoration-none" itemProp="name">
            {p.name}
          </Link>
        </h3>
        <Rating value={p.rating} count={p.reviewCount} />
        <div className="mt-auto pt-2 d-flex align-items-baseline gap-2" itemProp="offers" itemScope itemType="https://schema.org/Offer">
          <meta itemProp="priceCurrency" content={p.currency} />
          {p.salePrice ? (
            <>
              <span className="price fw-bold text-danger" data-price={p.salePrice} itemProp="price" content={String(p.salePrice)}>
                {formatMoney(p.salePrice)}
              </span>
              <s className="price-original small text-body-secondary" data-price={p.price}>{formatMoney(p.price)}</s>
            </>
          ) : (
            <span className="price fw-bold" data-price={p.price} itemProp="price" content={String(p.price)}>{formatMoney(p.price)}</span>
          )}
        </div>
        <div className="small mt-1">
          {p.inStock ? (
            <span className="stock text-success" data-stock={p.inventory}>In stock</span>
          ) : (
            <span className="stock text-danger" data-stock="0">Out of stock</span>
          )}
        </div>
      </div>
    </article>
  );
}
