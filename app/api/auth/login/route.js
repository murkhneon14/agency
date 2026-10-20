import { createAdminClient } from "../../../../lib/supabase/admin.js";
import { verifyPassword } from "../../../../lib/auth/password.js";
import { createSessionToken, setSessionCookie } from "../../../../lib/auth/session.js";
import { loginSchema } from "../../../../lib/validations/schemas.js";
import { readJson, jsonError } from "../../../../lib/http/responses.js";

export async function POST(request) {
  try {
    const body = await readJson(request);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues?.[0]?.message || "Invalid email or password.";
      return jsonError(issue, 400);
    }

    const { email, password } = parsed.data;
    const db = createAdminClient();

    const { data: profile, error } = await db
      .from("profiles")
      .select("id, email, password_hash, role, full_name")
      .ilike("email", email.trim())
      .maybeSingle();

    if (error || !profile || !profile.password_hash) {
      return jsonError("Invalid email or password.", 401);
    }

    const isValid = await verifyPassword(password, profile.password_hash);
    if (!isValid) {
      return jsonError("Invalid email or password.", 401);
    }

    const token = createSessionToken({
      userId: profile.id,
      email: profile.email,
      role: profile.role,
    });

    await setSessionCookie(token);

    return Response.json({
      success: true,
      role: profile.role,
      user: {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        role: profile.role,
      },
    });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Unable to sign in.", 500);
  }
}
