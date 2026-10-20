import { requireRole } from "../../../../lib/auth/guards.js";
import { jsonError, readJson, roleErrorResponse } from "../../../../lib/http/responses.js";
import { projectCreateSchema } from "../../../../lib/validations/schemas.js";

export const dynamic = "force-dynamic";

export async function GET() {
  const context = await requireRole(["ADMIN"]);
  const denied = roleErrorResponse(context);
  if (denied) return denied;
  const [projectsResult, clientsResult] = await Promise.all([
    context.db.from("projects").select("id,name,status,progress,total_price_paise,start_date,expected_completion_date,client_id,created_at,milestones(id,title,sort_order,work_status,work_percent,due_date,price_paise,paid_paise)").order("created_at", { ascending: false }),
    context.db.from("profiles").select("id,full_name").eq("role", "CLIENT").order("full_name"),
  ]);
  if (projectsResult.error || clientsResult.error) return jsonError("Unable to load agency projects.", 500, "database_error");
  return Response.json({ projects: projectsResult.data, clients: clientsResult.data }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request) {
  const context = await requireRole(["ADMIN"]);
  const denied = roleErrorResponse(context);
  if (denied) return denied;
  const parsed = projectCreateSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || "Check the project fields.", 422, "validation_error");
  const values = parsed.data;
  if (values.requestId) {
    const { data: projectRequest } = await context.db.from("project_requests").select("id,client_id").eq("id", values.requestId).maybeSingle();
    if (!projectRequest || projectRequest.client_id !== values.clientId) return jsonError("The selected request does not belong to this client.", 422, "invalid_request");
  }
  const { data: projectId, error } = await context.db.rpc("create_project_with_milestones", {
    p_client_id: values.clientId,
    p_request_id: values.requestId || null,
    p_name: values.name,
    p_description: values.description,
    p_total_price_paise: values.totalPricePaise,
    p_start_date: values.startDate || null,
    p_expected_completion_date: values.expectedCompletionDate || null,
    p_created_by: context.user.id,
    p_milestones: values.milestones.map((item) => ({ ...item, dueDate: item.dueDate || null })),
  });
  if (error) return jsonError(error.message.includes("Client account") ? "Choose an active client account." : "Unable to create the project. Check its milestone amounts and dates.", 422, "project_error");
  if (values.requestId) await context.db.from("project_requests").update({ status: "accepted" }).eq("id", values.requestId);
  return Response.json({ projectId }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
}
