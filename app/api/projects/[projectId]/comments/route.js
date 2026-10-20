import { requireRole } from "../../../../../lib/auth/guards.js";
import { jsonError, readJson, roleErrorResponse } from "../../../../../lib/http/responses.js";
import { z } from "zod";

export const dynamic = "force-dynamic";
const commentSchema = z.object({ body: z.string().trim().min(1).max(5000) });

export async function GET(_request, { params }) {
  const context = await requireRole(["CLIENT"]);
  const denied = roleErrorResponse(context);
  if (denied) return denied;
  const { projectId } = await params;
  const { data: project } = await context.db.from("projects").select("id").eq("id", projectId).eq("client_id", context.user.id).maybeSingle();
  if (!project) return jsonError("Project not found.", 404, "not_found");
  const { data, error } = await context.db.from("project_comments").select("id,body,comment_type,created_at,author_id,profiles(full_name)").eq("project_id", projectId).eq("visibility", "client").order("created_at", { ascending: true });
  if (error) return jsonError("Unable to load comments.", 500, "database_error");
  return Response.json({ comments: data }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request, { params }) {
  const context = await requireRole(["CLIENT"]);
  const denied = roleErrorResponse(context);
  if (denied) return denied;
  const { projectId } = await params;
  const parsed = commentSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError("Enter a comment of up to 5,000 characters.", 422, "validation_error");
  const { data: project } = await context.db.from("projects").select("id").eq("id", projectId).eq("client_id", context.user.id).maybeSingle();
  if (!project) return jsonError("Project not found.", 404, "not_found");
  const { data, error } = await context.db.from("project_comments").insert({ project_id: projectId, author_id: context.user.id, body: parsed.data.body, visibility: "client", comment_type: "comment" }).select("id,body,comment_type,created_at").single();
  if (error) return jsonError("Unable to save this comment.", 500, "database_error");
  await context.db.from("audit_logs").insert({ actor_id: context.user.id, action: "project_comment.created", entity_type: "project_comment", entity_id: data.id });
  const { data: admins } = await context.db.from("profiles").select("id").eq("role", "ADMIN");
  if (admins?.length) await context.db.from("notifications").insert(admins.map((admin) => ({ profile_id: admin.id, project_id: projectId, event_type: "project_comment.created", title: "New client comment", body: "A client added a comment to a project.", href: `/admin/projects/${projectId}` })));
  return Response.json({ comment: data }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
}
