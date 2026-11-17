import { NextResponse } from "next/server";
import { createCsrf, CSRF_COOKIE, csrfCookieOptions } from "@/lib/csrf";

/** GET /api/auth/csrf — issues a CSRF token (cookie + JSON body). */
export async function GET() {
  const { token, cookieValue } = await createCsrf();
  const res = NextResponse.json({ csrfToken: token, header: "X-CSRF-Token", field: "csrfToken" });
  res.headers.set("Cache-Control", "no-store");
  res.cookies.set(CSRF_COOKIE, cookieValue, csrfCookieOptions);
  return res;
}
