import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

/** GET /api/auth/me — returns the current session, or 401. */
export async function GET(req: NextRequest) {
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ authenticated: false }, { status: 401 });
  return NextResponse.json({
    authenticated: true,
    user: { username: session.sub, name: session.name, role: session.role },
    expiresAt: session.exp ? new Date(session.exp * 1000).toISOString() : null,
  });
}
