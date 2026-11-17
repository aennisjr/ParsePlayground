import Link from "next/link";

export const metadata = { title: "Access denied", robots: { index: false } };

export default function Forbidden() {
  return (
    <div className="container py-5 text-center">
      <h1 className="display-6">403 — Access denied</h1>
      <p className="text-body-secondary" data-testid="forbidden-message">Your account does not have permission to view this page.</p>
      <Link href="/dashboard" className="btn btn-primary">Back to dashboard</Link>
    </div>
  );
}
