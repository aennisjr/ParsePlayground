import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { DATASETS } from "@/lib/data";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

export default async function Dashboard() {
  const session = await getSession();
  if (!session) return null;
  const isPremium = session.role === "premium" || session.role === "admin";
  const lowStock = DATASETS.products.filter((p) => p.inventory > 0 && p.inventory < 10).slice(0, 5);

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Welcome, <span data-testid="user-name">{session.name}</span></h1>
        <form method="post" action="/api/auth/logout">
          <button className="btn btn-outline-secondary btn-sm" data-testid="logout-button">Log out</button>
        </form>
      </div>
      <p>Signed in as <code data-testid="username">{session.sub}</code> with role <span className="badge text-bg-secondary" data-testid="role">{session.role}</span>.</p>

      <div className="row g-4 mt-2">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h2 className="h5">Low stock</h2>
              <table className="table table-sm mb-0" id="low-stock">
                <thead><tr><th>SKU</th><th>Product</th><th className="text-end">Units</th></tr></thead>
                <tbody>{lowStock.map((p) => <tr key={p.id}><td>{p.sku}</td><td>{p.name}</td><td className="text-end">{p.inventory}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        </div>
        {isPremium && (
          <div className="col-md-6">
            <div className="card border-info shadow-sm h-100" data-testid="premium-panel">
              <div className="card-body">
                <h2 className="h5">Premium insights</h2>
                <p className="small">Premium accounts can see revenue projections and export tools.</p>
                <Link href="/dashboard/premium" className="btn btn-info btn-sm">Open premium area</Link>
              </div>
            </div>
          </div>
        )}
        {session.role === "admin" && (
          <div className="col-12">
            <div className="alert alert-warning mb-0" data-testid="admin-link">Administrator tools are available in the <Link href="/admin">admin area</Link>.</div>
          </div>
        )}
      </div>
    </div>
  );
}
