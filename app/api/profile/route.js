import { requireRole } from "../../../lib/auth/guards.js";
import { jsonError, readJson, roleErrorResponse } from "../../../lib/http/responses.js";
import { z } from "zod";

export const dynamic = "force-dynamic";
const profileSchema = z.object({ full_name: z.string().trim().min(1).max(120), company: z.string().trim().max(120).optional().default(""), phone: z.string().trim().max(40).optional().default("") });

export async function PATCH(request) {
  const context = await requireRole(["CLIENT", "TEAM_MEMBER", "ADMIN"]);
  const denied = roleErrorResponse(context);
  if (denied) return denied;
  const parsed = profileSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError("Check your profile fields and try again.", 422, "validation_error");
  const { data, error } = await context.db.from("profiles").update({ full_name: parsed.data.full_name, company: parsed.data.company, phone: parsed.data.phone }).eq("id", context.user.id).select("id,full_name,company,phone,role").single();
  if (error) return jsonError("Unable to update your profile.", 500, "database_error");
  return Response.json({ profile: data }, { headers: { "Cache-Control": "private, no-store" } });
}
