import type { Metadata } from "next";
import { headers } from "next/headers";
import { CSRF_REQUEST_HEADER } from "@/lib/csrf";
import { USERS } from "@/lib/auth";

export const metadata: Metadata = { title: "Login", alternates: { canonical: "/login" } };

const ERRORS: Record<string, string> = {
  validation: "Username and password are required.",
  invalid_credentials: "Username and password do not match any account.",
  account_locked: "Sorry, this account has been locked.",
  csrf_invalid: "Your form expired. Please try again.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const csrfToken = (await headers()).get(CSRF_REQUEST_HEADER) ?? "";
  const error = sp.error ? ERRORS[sp.error] ?? "Login failed." : null;

  return (
    <div className="container py-5">
      <div className="row justify-content-center g-5">
        <div className="col-md-6 col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h1 className="h3 mb-4">Sign in</h1>
              {sp.loggedOut && <div className="alert alert-success" role="status" data-testid="logout-message">You have been logged out.</div>}
              {error && <div className="alert alert-danger" role="alert" data-testid="login-error" data-error-code={sp.error}>{error}</div>}
              <form id="login-form" method="post" action="/api/auth/login" noValidate={false}>
                <input type="hidden" name="csrfToken" value={csrfToken} />
                <input type="hidden" name="next" value={sp.next ?? "/dashboard"} />
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input id="username" name="username" className="form-control" autoComplete="username" required maxLength={64} data-testid="username" />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input id="password" name="password" type="password" className="form-control" autoComplete="current-password" required maxLength={128} data-testid="password" />
                </div>
                <div className="form-check mb-3">
                  <input id="rememberMe" name="rememberMe" type="checkbox" className="form-check-input" data-testid="remember-me" />
                  <label htmlFor="rememberMe" className="form-check-label">Remember me for 30 days</label>
                </div>
                <button type="submit" className="btn btn-primary w-100" data-testid="login-button">Sign in</button>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-4">
          <h2 className="h5">Test accounts</h2>
          <p className="small text-body-secondary">Every password is <code>password123</code>.</p>
          <table className="table table-sm small" id="test-accounts">
            <thead><tr><th>Username</th><th>Behaviour</th></tr></thead>
            <tbody>
              {USERS.map((u) => (
                <tr key={u.username}>
                  <td><code>{u.username}</code></td>
                  <td>{u.locked ? "Locked out" : u.loginDelayMs ? `Login delayed ${u.loginDelayMs / 1000}s` : u.role === "admin" ? "Admin pages" : u.role === "premium" ? "Premium dashboard" : "Normal login"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
