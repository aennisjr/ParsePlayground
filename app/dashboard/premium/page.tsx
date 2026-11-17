import type { Metadata } from "next";
import { DATASETS } from "@/lib/data";

export const metadata: Metadata = { title: "Premium insights", robots: { index: false } };

export default function PremiumPage() {
  const byCategory = Object.entries(
    DATASETS.products.reduce<Record<string, { units: number; value: number }>>((acc, p) => {
      const c = (acc[p.category] ??= { units: 0, value: 0 });
      c.units += p.inventory;
      c.value += p.inventory * (p.salePrice ?? p.price);
      return acc;
    }, {}),
  ).sort((a, b) => b[1].value - a[1].value);

  return (
    <div className="container py-5">
      <h1 className="h3 mb-4">Premium insights</h1>
      <table className="table table-striped bg-white shadow-sm" id="inventory-value">
        <thead><tr><th>Category</th><th className="text-end">Units in stock</th><th className="text-end">Stock value (USD)</th></tr></thead>
        <tbody>
          {byCategory.map(([cat, v]) => (
            <tr key={cat} data-category={cat}>
              <td>{cat}</td>
              <td className="text-end">{v.units.toLocaleString("en-US")}</td>
              <td className="text-end">{v.value.toLocaleString("en-US", { style: "currency", currency: "USD" })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
