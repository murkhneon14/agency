import { requireRole } from "../../../../../../../lib/auth/guards.js";
import { jsonError, readJson, roleErrorResponse } from "../../../../../../../lib/http/responses.js";
import { z } from "zod";

export const dynamic = "force-dynamic";
const milestoneUpdateSchema = z.object({
  workStatus: z.enum(["not_started", "in_progress", "completed", "blocked"]),
  workPercent: z.number().int().min(0).max(100),
  dueDate: z.string().date().nullable().optional(),
}).refine((value) => value.workStatus !== "completed" || value.workPercent === 100, { message: "Completed milestones must be 100% complete." });

export async function PATCH(request, { params }) {
  const context = await requireRole(["ADMIN"]);
  const denied = roleErrorResponse(context);
  if (denied) return denied;
  const { projectId, milestoneId } = await params;
  const parsed = milestoneUpdateSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || "Choose a valid milestone status.", 422, "validation_error");
  const { data: milestone, error } = await context.db.from("milestones").update({ work_status: parsed.data.workStatus, work_percent: parsed.data.workPercent, approval_status: parsed.data.workStatus === "completed" ? "pending" : "not_submitted", due_date: parsed.data.dueDate ?? null, completed_at: parsed.data.workStatus === "completed" ? new Date().toISOString() : null }).eq("id", milestoneId).eq("project_id", projectId).select("id,project_id,work_status,work_percent,due_date").maybeSingle();
  if (error) return jsonError("Unable to update this milestone.", 500, "database_error");
  if (!milestone) return jsonError("Milestone not found.", 404, "not_found");
  await context.db.from("audit_logs").insert({ actor_id: context.user.id, action: "milestone.progress_updated", entity_type: "milestone", entity_id: milestone.id, metadata: { work_status: milestone.work_status, work_percent: milestone.work_percent } });
  await context.db.from("project_updates").insert({ project_id: projectId, milestone_id: milestone.id, author_id: context.user.id, title: `Milestone ${milestone.work_status.replaceAll("_", " ")}`, body: `Progress updated to ${milestone.work_percent}%.`, visibility: "client" });
  const { data: project } = await context.db.from("projects").select("client_id,name").eq("id", projectId).maybeSingle();
  if (project) await context.db.from("notifications").insert({ profile_id: project.client_id, project_id: projectId, event_type: "milestone.updated", title: "Project milestone updated", body: `${milestone.work_status.replaceAll("_", " ")} · ${milestone.work_percent}% complete.`, href: `/dashboard/projects/${projectId}` });
  return Response.json({ milestone }, { headers: { "Cache-Control": "private, no-store" } });
}
