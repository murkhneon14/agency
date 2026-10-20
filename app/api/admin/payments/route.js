import { requireRole } from "../../../../lib/auth/guards.js";
import { jsonError, roleErrorResponse } from "../../../../lib/http/responses.js";

export const dynamic = "force-dynamic";

export async function GET() {
  const context = await requireRole(["ADMIN"]);
  const denied = roleErrorResponse(context);
  if (denied) return denied;
  const { data, error } = await context.db.from("payments").select("id,project_id,client_id,amount_paise,status,reference,note,admin_note,created_at,projects(name)").order("created_at", { ascending: false });
  if (error) return jsonError("Unable to load payment records.", 500, "database_error");
  return Response.json({ payments: data }, { headers: { "Cache-Control": "private, no-store" } });
}
