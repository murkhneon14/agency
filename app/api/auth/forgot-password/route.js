import crypto from "node:crypto";
import { createAdminClient } from "../../../../lib/supabase/admin.js";
import { forgotPasswordSchema } from "../../../../lib/validations/schemas.js";
import { readJson, jsonError } from "../../../../lib/http/responses.js";

export async function POST(request) {
  try {
    const body = await readJson(request);
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues?.[0]?.message || "Invalid email address.";
      return jsonError(issue, 400);
    }

    const { email } = parsed.data;
    const db = createAdminClient();

    const { data: profile } = await db
      .from("profiles")
      .select("id, email")
      .ilike("email", email.trim())
      .maybeSingle();

    if (profile) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

      await db.from("password_resets").insert({
        profile_id: profile.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
      });

      // Output for development/testing visibility
      if (process.env.NODE_ENV !== "production") {
        console.log(`[AUTH] Password reset requested for ${profile.email}. Reset link: /reset-password?token=${rawToken}`);
      }
    }

    return Response.json({
      success: true,
      message: "If an account exists for that address, a reset link is on its way.",
    });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Unable to process request.", 500);
  }
}
