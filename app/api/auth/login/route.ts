import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import {
  findUser,
  REMEMBER_ME_TTL_SECONDS,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  sessionCookieOptions,
  signSession,
} from "@/lib/auth";
import { CSRF_COOKIE, verifyCsrf } from "@/lib/csrf";
import { redirectTo } from "@/lib/redirect";

/**
 * POST /api/auth/login
 * Accepts an HTML form post (redirects) or JSON (returns JSON).
 * Fields: username, password, rememberMe, csrfToken (or X-CSRF-Token header).
 */
export async function POST(req: NextRequest) {
  const isJson = (req.headers.get("content-type") ?? "").includes("application/json");
  let fields: Record<string, string> = {};
  if (isJson) {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    fields = Object.fromEntries(Object.entries(body).map(([k, v]) => [k, String(v ?? "")]));
  } else {
    const form = await req.formData();
    fields = Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v)]));
  }
  const next = safeNext(fields.next);

  const fail = (status: number, code: string, message: string) => {
    if (isJson) return NextResponse.json({ ok: false, error: code, message }, { status });
    const qs = new URLSearchParams({ error: code });
    if (next !== "/dashboard") qs.set("next", next);
    return redirectTo(`/login?${qs}`);
  };

  const csrfOk = await verifyCsrf(req.cookies.get(CSRF_COOKIE)?.value, fields.csrfToken || req.headers.get("x-csrf-token"));
  if (!csrfOk) return fail(403, "csrf_invalid", "Missing or invalid CSRF token. Fetch one from /api/auth/csrf first.");

  const username = (fields.username ?? "").trim();
  const password = fields.password ?? "";
  if (!username || !password) return fail(400, "validation", "Username and password are required.");
  if (username.length > 64 || password.length > 128) return fail(400, "validation", "Input is too long.");

  const user = findUser(username);
  const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (user?.loginDelayMs) await new Promise((r) => setTimeout(r, user.loginDelayMs));
  if (!user || !valid) return fail(401, "invalid_credentials", "Username and password do not match any account.");
  if (user.locked) return fail(423, "account_locked", "Sorry, this account has been locked.");

  const remember = ["on", "true", "1"].includes((fields.rememberMe ?? "").toLowerCase());
  const ttl = remember ? REMEMBER_ME_TTL_SECONDS : SESSION_TTL_SECONDS;
  const token = await signSession(user, ttl);

  const res = isJson
    ? NextResponse.json({ ok: true, user: { username: user.username, role: user.role }, redirect: next })
    : redirectTo(next);
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(remember ? REMEMBER_ME_TTL_SECONDS : undefined));
  res.cookies.delete(CSRF_COOKIE); // rotate the CSRF token after login
  return res;
}

/** Only allow same-site relative redirects. */
function safeNext(value: string | undefined): string {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}
