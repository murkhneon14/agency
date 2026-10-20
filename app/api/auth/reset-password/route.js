import crypto from "node:crypto";
import { createAdminClient } from "../../../../lib/supabase/admin.js";
import { hashPassword } from "../../../../lib/auth/password.js";
import { resetPasswordSchema } from "../../../../lib/validations/schemas.js";
import { readJson, jsonError } from "../../../../lib/http/responses.js";

export async function POST(request) {
  try {
    const body = await readJson(request);
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues?.[0]?.message || "Invalid password or token.";
      return jsonError(issue, 400);
    }

    const { token, password } = parsed.data;
    const db = createAdminClient();

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const nowIso = new Date().toISOString();

    const { data: resetRecord, error: resetError } = await db
      .from("password_resets")
      .select("id, profile_id, expires_at, used_at")
      .eq("token_hash", tokenHash)
      .is("used_at", null)
      .gt("expires_at", nowIso)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (resetError || !resetRecord) {
      return jsonError("This password reset link is invalid or has expired.", 400);
    }

    const newPasswordHash = await hashPassword(password);

    const { error: updateError } = await db
      .from("profiles")
      .update({
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString(),
      })
      .eq("id", resetRecord.profile_id);

    if (updateError) {
      return jsonError("Failed to update password. Please try again.", 500);
    }

    await db
      .from("password_resets")
      .update({ used_at: new Date().toISOString() })
      .eq("id", resetRecord.id);

    return Response.json({ success: true });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Unable to reset password.", 500);
  }
}
