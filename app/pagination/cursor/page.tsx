import type { Metadata } from "next";
import Link from "next/link";
import { decodeCursor } from "@/lib/api";
import { cleanParams, formatMoney } from "@/lib/format";
import { productBatch } from "@/lib/pagination";
import Breadcrumbs from "@/components/Breadcrumbs";

type SP = Promise<Record<string, string | string[] | undefined>>;

const PAGE_SIZE = 20;

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const { after } = cleanParams(await searchParams);
  return {
    title: "Cursor pagination",
    description: "Pages linked by an opaque cursor, with no page numbers or totals. Follow the Next link until it runs out.",
    alternates: { canonical: "/pagination/cursor" },
    robots: after ? { index: false, follow: true } : undefined,
  };
}

export default async function CursorPage({ searchParams }: { searchParams: SP }) {
  const { after } = cleanParams(await searchParams);
  const invalid = after !== undefined && decodeCursor(after) === null;
  const batch = productBatch(`cursor=${invalid || !after ? "" : encodeURIComponent(after)}&limit=${PAGE_SIZE}`);

  return (
    <div className="container py-4">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Pagination", href: "/pagination" }, { label: "Cursor", href: "/pagination/cursor" }]} />
      <h1 className="h3">Cursor pagination</h1>
      <p className="text-body-secondary col-lg-8">
        Each page links to the next with an opaque token in <code>?after=</code>. There are no page numbers and no total, just as
        in many real APIs and activity feeds. Treat the token as a black box and keep following <strong>Next</strong>.
      </p>

      {invalid && (
        <div className="alert alert-danger" role="alert" data-testid="invalid-cursor">
          That cursor isn&apos;t valid, so you&apos;re seeing the first page. Cursors are only valid exactly as the site gives them to you.
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-striped bg-white shadow-sm align-middle" id="product-table" data-testid="product-table">
          <thead>
            <tr><th scope="col">SKU</th><th scope="col">Product</th><th scope="col">Brand</th><th scope="col">Category</th><th scope="col" className="text-end">Price</th><th scope="col" className="text-end">Stock</th></tr>
          </thead>
          <tbody>
            {batch.items.map((p) => (
              <tr key={p.id} data-product-id={p.id}>
                <td className="sku text-nowrap"><code>{p.sku}</code></td>
                <td className="name"><Link href={`/products/${p.slug}`}>{p.name}</Link></td>
                <td className="brand">{p.brand}</td>
                <td className="category">{p.category}</td>
                <td className="price text-end text-nowrap" data-price={p.salePrice ?? p.price}>{formatMoney(p.salePrice ?? p.price)}</td>
                <td className="stock text-end" data-stock={p.inventory}>{p.inventory}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <nav className="d-flex justify-content-between align-items-center mt-3" aria-label="Cursor pagination" data-testid="cursor-nav">
        {after && !invalid ? <Link href="/pagination/cursor" className="btn btn-outline-secondary btn-sm" data-testid="first-page">↺ Start over</Link> : <span />}
        {batch.nextCursor ? (
          <Link href={`/pagination/cursor?after=${batch.nextCursor}`} rel="next" className="btn btn-primary btn-sm" data-testid="next-page">Next →</Link>
        ) : (
          <span className="text-body-secondary small" data-testid="end-of-results">End of results</span>
        )}
      </nav>
    </div>
  );
}
