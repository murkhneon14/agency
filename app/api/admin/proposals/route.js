import { requireRole } from "../../../../lib/auth/guards.js";
import { jsonError, readJson, roleErrorResponse } from "../../../../lib/http/responses.js";
import { proposalCreateSchema } from "../../../../lib/validations/schemas.js";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const context = await requireRole(["ADMIN"]);
  const denied = roleErrorResponse(context);
  if (denied) return denied;
  const parsed = proposalCreateSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || "Check the proposal fields.", 422, "validation_error");
  const values = parsed.data;
  const totalPricePaise = values.milestones.reduce((sum, item) => sum + item.pricePaise, 0);
  const { data: proposalId, error } = await context.db.rpc("create_proposal_with_milestones", {
    p_request_id: values.requestId,
    p_admin_id: context.user.id,
    p_title: values.title,
    p_description: values.description,
    p_total_price_paise: totalPricePaise,
    p_expires_at: values.expiresAt ? `${values.expiresAt}T23:59:59.000Z` : null,
    p_milestones: values.milestones.map((item) => ({ ...item, dueDate: item.dueDate || null })),
  });
  if (error) return jsonError(error.message.includes("Request was not found") ? "Request not found." : "Unable to create this proposal. Check the request status and milestone values.", 422, "proposal_error");
  return Response.json({ proposalId }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
}
