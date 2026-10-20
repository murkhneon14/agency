import { clearSessionCookie } from "../../../../lib/auth/session.js";

export async function POST() {
  await clearSessionCookie();
  return Response.json({ success: true });
}
