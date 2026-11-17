/**
 * Stateless CSRF protection (signed double-submit cookie).
 *
 * GET /api/auth/csrf issues a random token in a cookie and in the JSON body.
 * The cookie value is "<token>.<hmac>", so it can't be forged without the
 * server secret. A state-changing request must send the same token in a form
 * field (`csrfToken`) or the `X-CSRF-Token` header.
 */
import { csrfKey } from "./auth";

export const CSRF_COOKIE = "pp_csrf";
/** Request header the proxy uses to hand the /login page its CSRF token. */
export const CSRF_REQUEST_HEADER = "x-pp-csrf-token";

const toHex = (buf: ArrayBuffer | Uint8Array) =>
  Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");

async function hmac(value: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", csrfKey(), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toHex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}

export async function createCsrf(): Promise<{ token: string; cookieValue: string }> {
  const token = toHex(crypto.getRandomValues(new Uint8Array(24)));
  return { token, cookieValue: `${token}.${await hmac(token)}` };
}

export async function verifyCsrf(cookieValue: string | undefined, submitted: string | undefined | null): Promise<boolean> {
  if (!cookieValue || !submitted) return false;
  const [token, sig] = cookieValue.split(".");
  if (!token || !sig || token !== submitted) return false;
  const expected = await hmac(token);
  // constant-time compare
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}

export const csrfCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 2,
};
