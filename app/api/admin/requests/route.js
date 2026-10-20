import { requireRole } from "../../../../lib/auth/guards.js";
import { jsonError, roleErrorResponse } from "../../../../lib/http/responses.js";

export const dynamic = "force-dynamic";

export async function GET() {
  const context = await requireRole(["ADMIN"]);
  const denied = roleErrorResponse(context);
  if (denied) return denied;
  const { data: requests, error } = await context.db.from("project_requests").select("*").order("submitted_at", { ascending: false });
  if (error) return jsonError("Unable to load project requests.", 500, "database_error");
  const ids = [...new Set((requests || []).map((item) => item.client_id))];
  const { data: clients } = ids.length ? await context.db.from("profiles").select("id,full_name").in("id", ids) : { data: [] };
  const clientNames = new Map((clients || []).map((item) => [item.id, item.full_name]));
  return Response.json({ requests: (requests || []).map((item) => ({ ...item, client_name: clientNames.get(item.client_id) || item.name })) }, { headers: { "Cache-Control": "private, no-store" } });
}
