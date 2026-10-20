import { requireRole } from "../../../../../../lib/auth/guards.js";
import { jsonError, readJson, roleErrorResponse } from "../../../../../../lib/http/responses.js";
import { proposalRevisionSchema } from "../../../../../../lib/validations/schemas.js";

export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  const context = await requireRole(["ADMIN"]);
  const denied = roleErrorResponse(context);
  if (denied) return denied;
  const { proposalId } = await params;
  const parsed = proposalRevisionSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || "Check the proposal fields.", 422, "validation_error");
  const values = parsed.data;
  const totalPricePaise = values.milestones.reduce((sum,item)=>sum+item.pricePaise,0);
  const { data: version, error } = await context.db.rpc("revise_proposal", {
    p_proposal_id: proposalId,
    p_admin_id: context.user.id,
    p_title: values.title,
    p_description: values.description,
    p_total_price_paise: totalPricePaise,
    p_expires_at: values.expiresAt ? `${values.expiresAt}T23:59:59.000Z` : null,
    p_milestones: values.milestones.map((item)=>({...item,dueDate:item.dueDate||null})),
  });
  if (error) return jsonError("Unable to revise this proposal. Accepted or closed proposals cannot be edited.", 409, "proposal_closed");
  return Response.json({ proposalId, version }, { headers: { "Cache-Control": "private, no-store" } });
}
