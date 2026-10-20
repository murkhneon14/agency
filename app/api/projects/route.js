import { requireRole } from "../../../lib/auth/guards.js";
import { jsonError, roleErrorResponse } from "../../../lib/http/responses.js";

export const dynamic = "force-dynamic";

export async function GET() {
  const context = await requireRole(["CLIENT"]);
  const denied = roleErrorResponse(context);
  if (denied) return denied;
  const { data, error } = await context.db.from("projects")
    .select("id,name,description,status,progress,total_price_paise,start_date,expected_completion_date,created_at,milestones(id,title,sort_order,work_status,work_percent,due_date,price_paise,paid_paise)")
    .eq("client_id", context.user.id).order("created_at", { ascending: false });
  if (error) return jsonError("Unable to load projects.", 500, "database_error");
  return Response.json({ projects: data }, { headers: { "Cache-Control": "private, no-store" } });
}
