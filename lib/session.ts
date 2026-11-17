import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "./auth";

/** Reads the session in a Server Component. The proxy has already enforced access. */
export async function getSession() {
  return verifySession((await cookies()).get(SESSION_COOKIE)?.value);
}
