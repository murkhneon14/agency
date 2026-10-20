import crypto from "node:crypto";
import { createAdminClient } from "../../../../lib/supabase/admin.js";
import { hashPassword } from "../../../../lib/auth/password.js";
import { createSessionToken, setSessionCookie } from "../../../../lib/auth/session.js";
import { signupSchema } from "../../../../lib/validations/schemas.js";
import { readJson, jsonError } from "../../../../lib/http/responses.js";

export async function POST(request) {
  try {
    const body = await readJson(request);
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues?.[0]?.message || "Invalid registration data.";
      return jsonError(issue, 400);
    }

    const { fullName, email, password } = parsed.data;
    const db = createAdminClient();

    // Check if an account already exists with this email
    const { data: existing } = await db
      .from("profiles")
      .select("id")
      .ilike("email", email.trim())
      .maybeSingle();

    if (existing) {
      return jsonError("An account with this email address already exists.", 409);
    }

    const passwordHash = await hashPassword(password);
    const userId = crypto.randomUUID();

    const { data: profile, error } = await db
      .from("profiles")
      .insert({
        id: userId,
        email: email.trim().toLowerCase(),
        password_hash: passwordHash,
        full_name: fullName.trim(),
        role: "CLIENT",
      })
      .select("id, email, full_name, role")
      .single();

    if (error) {
      return jsonError(error.message || "Failed to create account.", 500);
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
    }, { status: 201 });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Unable to register.", 500);
  }
}
