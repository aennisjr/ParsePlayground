/**
 * Stateless authentication: the session is a signed JWT (HS256) in an
 * HttpOnly cookie. There is no session store, so nothing needs a database.
 * Uses `jose` (Web Crypto) so it runs on any serverless or edge runtime.
 */
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import usersConfig from "@/config/users.json";

export type Role = "standard" | "premium" | "admin";
export type ConfigUser = {
  username: string;
  displayName: string;
  role: Role;
  passwordHash: string;
  locked: boolean;
  loginDelayMs: number;
};
export type Session = JWTPayload & { sub: string; name: string; role: Role };

export const SESSION_COOKIE = "pp_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours
export const REMEMBER_ME_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export const USERS = usersConfig.users as ConfigUser[];
export const findUser = (username: string) =>
  USERS.find((u) => u.username === username.trim().toLowerCase());

function secretKey(name: "JWT_SECRET" | "CSRF_SECRET"): Uint8Array<ArrayBuffer> {
  const value = process.env[name];
  if (!value) {
    if (process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build") {
      throw new Error(`${name} must be set in production`);
    }
    return new TextEncoder().encode(`dev-only-${name}-not-for-production`);
  }
  return new TextEncoder().encode(value);
}
export const jwtKey = () => secretKey("JWT_SECRET");
export const csrfKey = () => secretKey("CSRF_SECRET");

export async function signSession(user: ConfigUser, ttlSeconds: number): Promise<string> {
  return new SignJWT({ name: user.displayName, role: user.role })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(user.username)
    .setIssuer("parseplayground")
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(jwtKey());
}

export async function verifySession(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, jwtKey(), { issuer: "parseplayground", algorithms: ["HS256"] });
    return payload as Session;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = (maxAge?: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  // Omitting maxAge makes it a browser-session cookie (no "Remember me").
  ...(maxAge ? { maxAge } : {}),
});

/** Which roles may visit which protected path prefixes. */
export const ROUTE_ROLES: { prefix: string; roles: Role[] }[] = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/dashboard/premium", roles: ["premium", "admin"] },
  { prefix: "/dashboard", roles: ["standard", "premium", "admin"] },
];
