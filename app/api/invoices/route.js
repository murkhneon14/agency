import { requireRole } from "../../../lib/auth/guards.js";
import { jsonError, roleErrorResponse } from "../../../lib/http/responses.js";

export const dynamic = "force-dynamic";

export async function GET() {
  const context = await requireRole(["CLIENT"]);
  const denied = roleErrorResponse(context);
  if (denied) return denied;
  const { data, error } = await context.db.from("invoices").select("id,invoice_number,project_id,status,total_paise,due_date,issued_at,created_at,projects(name)").eq("client_id", context.user.id).order("created_at", { ascending: false });
  if (error) return jsonError("Unable to load invoices.", 500, "database_error");
  return Response.json({ invoices: data }, { headers: { "Cache-Control": "private, no-store" } });
}
