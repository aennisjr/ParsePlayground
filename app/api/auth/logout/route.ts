import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";
import { redirectTo } from "@/lib/redirect";

/**
 * POST /api/auth/logout — clears the session cookie.
 * Logout is not CSRF-protected: forcing a logout is harmless, and it keeps
 * the endpoint easy to call from automation scripts.
 */
export async function POST(req: NextRequest) {
  const wantsJson = (req.headers.get("accept") ?? "").includes("application/json");
  const res = wantsJson
    ? NextResponse.json({ ok: true })
    : redirectTo("/login?loggedOut=1");
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
