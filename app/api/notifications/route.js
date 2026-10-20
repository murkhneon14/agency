import { getSignedInContext } from "../../../lib/auth/guards.js";
import { jsonError } from "../../../lib/http/responses.js";

export const dynamic = "force-dynamic";

export async function GET() {
  const context = await getSignedInContext();
  if (!context) return jsonError("Sign in to continue.", 401, "unauthenticated");
  const { data, error } = await context.db.from("notifications").select("id,event_type,title,body,href,read_at,created_at,project_id").eq("profile_id", context.user.id).order("created_at", { ascending: false }).limit(100);
  if (error) return jsonError("Unable to load notifications.", 500, "database_error");
  return Response.json({ notifications: data }, { headers: { "Cache-Control": "private, no-store" } });
}
