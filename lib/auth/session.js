import { cookies } from "next/headers";
import { createSessionToken, verifySessionToken, SESSION_DURATION_SECONDS } from "./tokens.js";

export const SESSION_COOKIE_NAME = "agency_session";
export { createSessionToken, verifySessionToken, SESSION_DURATION_SECONDS };

/**
 * Sets the session cookie on the current HTTP response.
 */
export async function setSessionCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

/**
 * Clears the session cookie on the current HTTP response.
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Retrieves and verifies the signed-in session user payload from cookies.
 */
export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}
