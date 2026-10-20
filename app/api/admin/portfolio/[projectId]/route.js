import { requireRole } from "../../../../../lib/auth/guards.js";
import { jsonError, readJson, roleErrorResponse } from "../../../../../lib/http/responses.js";
import { portfolioProjectSchema } from "../../../../../lib/validations/schemas.js";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  const context = await requireRole(["ADMIN"]);
  const denied = roleErrorResponse(context);
  if (denied) return denied;
  const { projectId } = await params;
  const parsed = portfolioProjectSchema.partial().safeParse(await readJson(request));
  if (!parsed.success || Object.keys(parsed.data || {}).length === 0) return jsonError("Provide valid portfolio fields.", 422, "validation_error");
  const value = parsed.data;
  const update = {};
  if (value.title !== undefined) update.title = value.title;
  if (value.slug !== undefined) update.slug = value.slug;
  if (value.description !== undefined) update.description = value.description;
  if (value.category !== undefined) update.category = value.category;
  if (value.technologies !== undefined) update.technologies = value.technologies;
  if (value.demoUrl !== undefined) update.demo_url = value.demoUrl || null;
  if (value.isDemo !== undefined) update.is_demo = value.isDemo;
  if (value.isPublished !== undefined) update.is_published = value.isPublished;
  if (value.sortOrder !== undefined) update.sort_order = value.sortOrder;
  const { data, error } = await context.db.from("portfolio_projects").update(update).eq("id", projectId).select("id,is_published,slug").maybeSingle();
  if (error) return jsonError("Unable to update this portfolio entry.", 409, "portfolio_conflict");
  if (!data) return jsonError("Portfolio entry not found.", 404, "not_found");
  await context.db.from("audit_logs").insert({ actor_id: context.user.id, action: "portfolio.updated", entity_type: "portfolio_project", entity_id: data.id, metadata: { is_published: data.is_published } });
  return Response.json({ project: data }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function DELETE(_request, { params }) {
  const context = await requireRole(["ADMIN"]);
  const denied = roleErrorResponse(context);
  if (denied) return denied;
  const { projectId } = await params;
  const { data, error } = await context.db.from("portfolio_projects").update({ is_published: false }).eq("id", projectId).select("id").maybeSingle();
  if (error) return jsonError("Unable to unpublish this portfolio entry.", 500, "database_error");
  if (!data) return jsonError("Portfolio entry not found.", 404, "not_found");
  return Response.json({ unpublished: true }, { headers: { "Cache-Control": "private, no-store" } });
}
