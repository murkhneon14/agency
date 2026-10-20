import { requireRole } from "../../../lib/auth/guards.js";
import { jsonError, roleErrorResponse } from "../../../lib/http/responses.js";

export const dynamic = "force-dynamic";

export async function GET() {
  const context = await requireRole(["CLIENT"]);
  const denied = roleErrorResponse(context);
  if (denied) return denied;
  const { data, error } = await context.db.from("proposals").select("id,title,description,total_price_paise,status,version,expires_at,created_at,proposal_milestones(id,sort_order,title,description,price_paise,due_date)").eq("client_id", context.user.id).order("created_at", { ascending: false });
  if (error) return jsonError("Unable to load proposals.", 500, "database_error");
  return Response.json({ proposals: data }, { headers: { "Cache-Control": "private, no-store" } });
}
