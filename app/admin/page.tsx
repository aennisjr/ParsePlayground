import type { Metadata } from "next";
import { USERS } from "@/lib/auth";
import { getStats } from "@/lib/stats";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default function AdminPage() {
  const stats = getStats();
  return (
    <div className="container py-5">
      <h1 className="h3 mb-4">Administration</h1>
      <div className="row g-4">
        <div className="col-lg-6">
          <h2 className="h5">User accounts</h2>
          <table className="table bg-white shadow-sm" id="admin-users">
            <thead><tr><th>Username</th><th>Role</th><th>Status</th></tr></thead>
            <tbody>
              {USERS.map((u) => (
                <tr key={u.username}>
                  <td>{u.username}</td>
                  <td>{u.role}</td>
                  <td>{u.locked ? <span className="badge text-bg-danger">Locked</span> : <span className="badge text-bg-success">Active</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="col-lg-6">
          <h2 className="h5">Request statistics</h2>
          <p className="small text-body-secondary">{stats.note} Instance started {stats.instanceStartedAt}.</p>
          <p>Total requests: <strong data-testid="total-requests">{stats.totalRequests}</strong></p>
        </div>
      </div>
    </div>
  );
}
