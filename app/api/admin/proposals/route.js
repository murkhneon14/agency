import { requireRole } from "../../../../lib/auth/guards.js";
import { jsonError, readJson, roleErrorResponse } from "../../../../lib/http/responses.js";
import { proposalCreateSchema } from "../../../../lib/validations/schemas.js";
import { formatINRFromPaise } from "../../../../lib/domain/finance.js";
import { notifyClientByEmail } from "../../../../lib/email/notifications.js";

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
  if (error) {
    console.error("[admin.proposals] create_proposal_with_milestones failed", {
      code: error.code,
      message: error.message,
      requestId: values.requestId,
    });

    const message = error.message.includes("Request was not found")
      ? "Request not found."
      : error.message.includes("Request is closed")
        ? "This request is closed and cannot receive a proposal."
        : error.message.includes("At least one milestone is required")
          ? "Add at least one milestone before sending the proposal."
          : error.message.includes("Milestone prices do not match")
            ? "Milestone prices do not match the proposal total."
            : "Unable to create this proposal. Check the server log for the database error.";

    return jsonError(message, 422, "proposal_error");
  }
  const { data: proposal } = await context.db.from("proposals").select("client_id").eq("id", proposalId).maybeSingle();
  if (proposal) await notifyClientByEmail(context.db, proposal.client_id, {
    subject: `A proposal is ready: ${values.title}`,
    title: "A proposal is ready for you",
    body: "Review the proposed project scope, milestones, and price in your client portal.",
    details: [
      { label: "Proposal", value: values.title },
      { label: "Total", value: formatINRFromPaise(totalPricePaise) },
      { label: "Milestones", value: values.milestones.length },
    ],
    href: "/dashboard/proposals",
    actionLabel: "Review proposal",
  });
  return Response.json({ proposalId }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
}
