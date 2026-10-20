import { requireRole } from "../../../lib/auth/guards.js";
import { jsonError, readJson, roleErrorResponse } from "../../../lib/http/responses.js";
import { projectRequestSchema } from "../../../lib/validations/schemas.js";

export const dynamic = "force-dynamic";

export async function GET() {
  const context = await requireRole(["CLIENT"]);
  const denied = roleErrorResponse(context);
  if (denied) return denied;
  const { data, error } = await context.db.from("project_requests").select("id,service,status,submitted_at,description").eq("client_id", context.user.id).order("submitted_at", { ascending: false });
  if (error) return jsonError("Unable to load requests.", 500, "database_error");
  return Response.json({ requests: data }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request) {
  const context = await requireRole(["CLIENT"]);
  const denied = roleErrorResponse(context);
  if (denied) return denied;
  const body = await readJson(request);
  const parsed = projectRequestSchema.safeParse(body);
  if (!parsed.success) return jsonError("Check the request fields and try again.", 422, "validation_error");
  const submission = parsed.data;
  const { data, error } = await context.db.from("project_requests").insert({
    client_id: context.user.id,
    name: context.profile.full_name || submission.name,
    email: context.user.email,
    company: submission.company,
    service: submission.service,
    budget: submission.budget,
    timeline: submission.timeline,
    description: submission.description,
  }).select("id,status,submitted_at").single();
  if (error) return jsonError("Unable to save this request. Please try again.", 500, "database_error");
  await context.db.from("audit_logs").insert({ actor_id: context.user.id, action: "project_request.created", entity_type: "project_request", entity_id: data.id });
  const { data: admins } = await context.db.from("profiles").select("id").eq("role", "ADMIN");
  if (admins?.length) await context.db.from("notifications").insert(admins.map((admin) => ({ profile_id: admin.id, event_type: "project_request.created", title: "New project request", body: `${submission.service} request received.`, href: "/admin/requests" })));
  return Response.json({ request: data }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
}
