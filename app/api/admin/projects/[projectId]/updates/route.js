import { requireRole } from "../../../../../../lib/auth/guards.js";
import { jsonError, readJson, roleErrorResponse } from "../../../../../../lib/http/responses.js";
import { z } from "zod";

export const dynamic = "force-dynamic";
const updateSchema = z.object({ title: z.string().trim().min(1).max(160), body: z.string().trim().min(1).max(5000), visibility: z.enum(["client", "internal"]) });

export async function POST(request, { params }) {
  const context = await requireRole(["ADMIN"]);
  const denied = roleErrorResponse(context);
  if (denied) return denied;
  const { projectId } = await params;
  const parsed = updateSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError("Enter an update title and message.", 422, "validation_error");
  const { data: project } = await context.db.from("projects").select("id,client_id").eq("id", projectId).maybeSingle();
  if (!project) return jsonError("Project not found.", 404, "not_found");
  const { data, error } = await context.db.from("project_updates").insert({ project_id: projectId, author_id: context.user.id, ...parsed.data }).select("id,title,body,visibility,created_at").single();
  if (error) return jsonError("Unable to save the project update.", 500, "database_error");
  await context.db.from("audit_logs").insert({ actor_id: context.user.id, action: "project_update.created", entity_type: "project_update", entity_id: data.id, metadata: { visibility: data.visibility } });
  if (data.visibility === "client") await context.db.from("notifications").insert({ profile_id: project.client_id, project_id: projectId, event_type: "project.updated", title: data.title, body: "A new update is available for your project.", href: `/dashboard/projects/${projectId}` });
  return Response.json({ update: data }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
}
