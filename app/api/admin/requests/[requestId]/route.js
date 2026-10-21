import { requireRole } from "../../../../../lib/auth/guards.js";
import { jsonError, readJson, roleErrorResponse } from "../../../../../lib/http/responses.js";
import { adminRequestStatusSchema } from "../../../../../lib/validations/schemas.js";
import { notifyClientByEmail } from "../../../../../lib/email/notifications.js";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  const context = await requireRole(["ADMIN"]);
  const denied = roleErrorResponse(context);
  if (denied) return denied;
  const { requestId } = await params;
  const parsed = adminRequestStatusSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError("Choose a valid request status.", 422, "validation_error");
  const { data, error } = await context.db.from("project_requests").update({ status: parsed.data.status }).eq("id", requestId).select("id,status,client_id").maybeSingle();
  if (error) return jsonError("Unable to update this request.", 500, "database_error");
  if (!data) return jsonError("Request not found.", 404, "not_found");
  await context.db.from("audit_logs").insert({ actor_id: context.user.id, action: "project_request.status_changed", entity_type: "project_request", entity_id: data.id, metadata: { status: data.status } });
  await context.db.from("notifications").insert({ profile_id: data.client_id, event_type: "project_request.status_changed", title: "Project request updated", body: `Your request is now ${data.status.replaceAll("_", " ")}.`, href: "/dashboard/requests" });
  await notifyClientByEmail(context.db, data.client_id, {
    subject: "Your project request was updated",
    title: "Project request updated",
    body: `Your request is now ${data.status.replaceAll("_", " ")}.`,
    href: "/dashboard/requests",
    actionLabel: "View your requests",
  });
  return Response.json({ request: data }, { headers: { "Cache-Control": "private, no-store" } });
}
