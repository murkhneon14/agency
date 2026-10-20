import { requireRole } from "../../../../lib/auth/guards.js";
import { jsonError, readJson, roleErrorResponse } from "../../../../lib/http/responses.js";
import { portfolioProjectSchema } from "../../../../lib/validations/schemas.js";

export const dynamic = "force-dynamic";

export async function GET() {
  const context = await requireRole(["ADMIN"]);
  const denied = roleErrorResponse(context);
  if (denied) return denied;
  const { data, error } = await context.db.from("portfolio_projects").select("*").order("sort_order").order("created_at", { ascending: false });
  if (error) return jsonError("Unable to load portfolio projects.", 500, "database_error");
  return Response.json({ projects: data }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request) {
  const context = await requireRole(["ADMIN"]);
  const denied = roleErrorResponse(context);
  if (denied) return denied;
  const parsed = portfolioProjectSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError("Check the portfolio entry fields.", 422, "validation_error");
  const value = parsed.data;
  const { data, error } = await context.db.from("portfolio_projects").insert({ title:value.title, slug:value.slug, description:value.description, category:value.category, technologies:value.technologies, demo_url:value.demoUrl||null, is_demo:value.isDemo, is_published:value.isPublished, sort_order:value.sortOrder, created_by:context.user.id }).select("id,slug").single();
  if (error) return jsonError("Unable to save this entry. The slug may already be in use.", 409, "portfolio_conflict");
  await context.db.from("audit_logs").insert({ actor_id: context.user.id, action: "portfolio.created", entity_type: "portfolio_project", entity_id: data.id });
  return Response.json({ project: data }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
}
