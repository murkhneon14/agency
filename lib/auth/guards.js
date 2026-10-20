import "server-only";
import { createAdminClient } from "../supabase/admin.js";
import { getSessionUser } from "./session.js";

export async function getSignedInContext() {
  const secret = process.env.AUTH_SECRET || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !secret) return null;

  const session = await getSessionUser();
  if (!session?.userId) return null;

  const db = createAdminClient();
  const { data: profile, error: profileError } = await db
    .from("profiles")
    .select("id, email, full_name, role, avatar_url, phone, company, created_at")
    .eq("id", session.userId)
    .maybeSingle();

  if (profileError || !profile) return null;

  return { user: { id: profile.id, email: profile.email }, profile, db };
}

export async function requireRole(allowedRoles) {
  const context = await getSignedInContext();
  if (!context) return { error: "unauthenticated", status: 401 };
  if (!allowedRoles.includes(context.profile.role)) return { error: "forbidden", status: 403 };
  return context;
}
