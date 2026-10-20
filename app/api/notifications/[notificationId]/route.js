import { getSignedInContext } from "../../../../lib/auth/guards.js";
import { jsonError } from "../../../../lib/http/responses.js";

export const dynamic = "force-dynamic";

export async function PATCH(_request, { params }) {
  const context = await getSignedInContext();
  if (!context) return jsonError("Sign in to continue.", 401, "unauthenticated");
  const { notificationId } = await params;
  const { data, error } = await context.db.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", notificationId).eq("profile_id", context.user.id).select("id,read_at").maybeSingle();
  if (error) return jsonError("Unable to update notification.", 500, "database_error");
  if (!data) return jsonError("Notification not found.", 404, "not_found");
  return Response.json({ notification: data }, { headers: { "Cache-Control": "private, no-store" } });
}
