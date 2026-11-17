import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { decodeJwt, decodeProtectedHeader } from "jose";
import { findUser, signSession, verifySession } from "@/lib/auth";

/**
 * JWT demonstration (bearer-token flow, no cookies, no CSRF).
 *
 *   POST /api/auth/jwt   {"username":"standard_user","password":"password123"}
 *        -> { access_token, token_type: "Bearer", expires_in }
 *   GET  /api/auth/jwt   Authorization: Bearer <token>
 *        -> decoded header + claims, and whether the signature is valid
 */
const TTL = 15 * 60;

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { username?: string; password?: string } | null;
  if (!body?.username || !body.password) {
    return NextResponse.json({ error: "validation", message: "JSON body with username and password is required." }, { status: 400 });
  }
  const user = findUser(body.username);
  if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }
  if (user.locked) return NextResponse.json({ error: "account_locked" }, { status: 423 });
  return NextResponse.json({ access_token: await signSession(user, TTL), token_type: "Bearer", expires_in: TTL });
}

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) {
    return NextResponse.json(
      { error: "missing_token", message: "Send Authorization: Bearer <token>. Get one with POST /api/auth/jwt." },
      { status: 401, headers: { "WWW-Authenticate": 'Bearer realm="parseplayground"' } },
    );
  }
  let header: unknown = null, claims: unknown = null;
  try {
    header = decodeProtectedHeader(token);
    claims = decodeJwt(token);
  } catch {
    return NextResponse.json({ error: "malformed_token" }, { status: 400 });
  }
  const verified = await verifySession(token);
  return NextResponse.json({ valid: Boolean(verified), header, claims }, { status: verified ? 200 : 401 });
}
