import { NextResponse } from "next/server";

/**
 * Redirect with a relative Location header (e.g. "/dashboard").
 *
 * Don't build redirect URLs from req.url in route handlers: on Netlify it
 * holds the internal deploy host (main--<site>.netlify.app), not the domain
 * the visitor used, which sends them to a host where their cookies don't
 * apply. Browsers resolve a relative Location against the current page, so
 * this works on any domain, preview or host.
 */
export function redirectTo(path: string, status: 302 | 303 | 307 = 303) {
  return new NextResponse(null, { status, headers: { Location: path } });
}
