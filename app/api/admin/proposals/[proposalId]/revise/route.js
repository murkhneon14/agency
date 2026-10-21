import { requireRole } from "../../../../../../lib/auth/guards.js";
import { jsonError, readJson, roleErrorResponse } from "../../../../../../lib/http/responses.js";
import { proposalRevisionSchema } from "../../../../../../lib/validations/schemas.js";
import { formatINRFromPaise } from "../../../../../../lib/domain/finance.js";
import { notifyClientByEmail } from "../../../../../../lib/email/notifications.js";

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
  const { data: proposal } = await context.db.from("proposals").select("client_id").eq("id", proposalId).maybeSingle();
  if (proposal) await notifyClientByEmail(context.db, proposal.client_id, {
    subject: `Proposal updated: ${values.title}`,
    title: "A proposal was updated",
    body: "The project scope, milestones, or price has changed. Review the latest version in your client portal.",
    details: [
      { label: "Proposal", value: values.title },
      { label: "Version", value: version },
      { label: "Total", value: formatINRFromPaise(totalPricePaise) },
      { label: "Milestones", value: values.milestones.length },
    ],
    href: "/dashboard/proposals",
    actionLabel: "Review updated proposal",
  });
  return Response.json({ proposalId, version }, { headers: { "Cache-Control": "private, no-store" } });
}
