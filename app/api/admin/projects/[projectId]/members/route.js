import { requireRole } from "../../../../../../lib/auth/guards.js";
import { jsonError, readJson, roleErrorResponse } from "../../../../../../lib/http/responses.js";
import { z } from "zod";

export const dynamic = "force-dynamic";
const memberSchema = z.object({ memberId: z.string().uuid() });

export async function POST(request, { params }) {
  const context = await requireRole(["ADMIN"]);
  const denied = roleErrorResponse(context);
  if (denied) return denied;
  const { projectId } = await params;
  const parsed = memberSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError("Choose a team member.", 422, "validation_error");
  const { data: member } = await context.db.from("profiles").select("id,role").eq("id", parsed.data.memberId).maybeSingle();
  if (!member || member.role !== "TEAM_MEMBER") return jsonError("Team member account not found.", 404, "not_found");
  const { error } = await context.db.from("project_members").upsert({ project_id: projectId, profile_id: member.id, membership_role: "TEAM_MEMBER", added_by: context.user.id }, { onConflict: "project_id,profile_id" });
  if (error) return jsonError("Unable to assign this team member.", 500, "database_error");
  await context.db.from("notifications").insert({ profile_id: member.id, project_id: projectId, event_type: "project.assigned", title: "Project assigned", body: "You were added as a team member on a project.", href: "/team" });
  await context.db.from("audit_logs").insert({ actor_id: context.user.id, action: "project_member.assigned", entity_type: "project", entity_id: projectId, metadata: { member_id: member.id } });
  return Response.json({ assigned: true }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
}
