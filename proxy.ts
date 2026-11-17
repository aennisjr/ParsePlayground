/**
 * Runs before matching requests (Next.js 16 "proxy", formerly middleware).
 *
 * 1. /login: makes sure a signed CSRF cookie exists and passes its token to
 *    the page through a request header, so the server-rendered form contains
 *    a hidden csrfToken input (realistic for requests/BeautifulSoup practice).
 * 2. /dashboard, /admin: verifies the JWT session cookie and the user's role.
 */
import { NextResponse, type NextRequest } from "next/server";
import { ROUTE_ROLES, SESSION_COOKIE, verifySession } from "@/lib/auth";
import { createCsrf, CSRF_COOKIE, csrfCookieOptions, CSRF_REQUEST_HEADER, verifyCsrf } from "@/lib/csrf";



export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/login") {
    const existing = req.cookies.get(CSRF_COOKIE)?.value;
    const existingToken = existing?.split(".")[0];
    if (existing && existingToken && (await verifyCsrf(existing, existingToken))) {
      const headers = new Headers(req.headers);
      headers.set(CSRF_REQUEST_HEADER, existingToken);
      return NextResponse.next({ request: { headers } });
    }
    const { token, cookieValue } = await createCsrf();
    const headers = new Headers(req.headers);
    headers.set(CSRF_REQUEST_HEADER, token);
    const res = NextResponse.next({ request: { headers } });
    res.cookies.set(CSRF_COOKIE, cookieValue, csrfCookieOptions);
    return res;
  }

  const rule = ROUTE_ROLES.find((r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`));
  if (!rule) return NextResponse.next();

  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (!rule.roles.includes(session.role)) {
    return NextResponse.rewrite(new URL("/forbidden", req.url), { status: 403 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/dashboard/:path*", "/admin/:path*"],
};
