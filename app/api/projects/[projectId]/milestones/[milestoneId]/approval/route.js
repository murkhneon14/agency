import { requireRole } from "../../../../../../../lib/auth/guards.js";
import { jsonError, readJson, roleErrorResponse } from "../../../../../../../lib/http/responses.js";
import { z } from "zod";

export const dynamic = "force-dynamic";
const approvalSchema = z.object({ status: z.enum(["approved", "revision_requested"]), comment: z.string().trim().max(3000).optional().default("") });

export async function PATCH(request, { params }) {
  const context = await requireRole(["CLIENT"]);
  const denied = roleErrorResponse(context);
  if (denied) return denied;
  const { projectId, milestoneId } = await params;
  const parsed = approvalSchema.safeParse(await readJson(request));
  if (!parsed.success || (parsed.data.status === "revision_requested" && !parsed.data.comment)) return jsonError("Add a short note when requesting revisions.", 422, "validation_error");
  const { data: project } = await context.db.from("projects").select("id").eq("id", projectId).eq("client_id", context.user.id).maybeSingle();
  if (!project) return jsonError("Project not found.", 404, "not_found");
  const { data: milestone } = await context.db.from("milestones").select("id,title,work_status,approval_status").eq("id", milestoneId).eq("project_id", projectId).maybeSingle();
  if (!milestone) return jsonError("Milestone not found.", 404, "not_found");
  if (milestone.work_status !== "completed") return jsonError("This milestone is not ready for review yet.", 409, "not_ready");
  if (!["pending", "revision_requested"].includes(milestone.approval_status)) return jsonError("This milestone is not awaiting client review.", 409, "not_ready");
  const { error } = await context.db.from("milestones").update({ approval_status: parsed.data.status }).eq("id", milestoneId);
  if (error) return jsonError("Unable to save the milestone review.", 500, "database_error");
  const commentType = parsed.data.status === "approved" ? "approval" : "revision_request";
  const body = parsed.data.comment || `Approved milestone: ${milestone.title}`;
  const { data: comment } = await context.db.from("project_comments").insert({ project_id: projectId, milestone_id: milestoneId, author_id: context.user.id, body, visibility: "client", comment_type: commentType }).select("id").single();
  await context.db.from("project_updates").insert({ project_id: projectId, milestone_id: milestoneId, author_id: context.user.id, title: parsed.data.status === "approved" ? "Milestone approved" : "Revision requested", body, visibility: "client" });
  if (comment?.id) await context.db.from("audit_logs").insert({ actor_id: context.user.id, action: `milestone.${parsed.data.status}`, entity_type: "milestone", entity_id: milestoneId });
  return Response.json({ status: parsed.data.status }, { headers: { "Cache-Control": "private, no-store" } });
}
