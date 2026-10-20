import { requireRole } from "../../../../../lib/auth/guards.js";
import { jsonError, roleErrorResponse } from "../../../../../lib/http/responses.js";

export const dynamic = "force-dynamic";

export async function POST(_request, { params }) {
  const context = await requireRole(["CLIENT"]);
  const denied = roleErrorResponse(context);
  if (denied) return denied;
  const { proposalId } = await params;
  const { data: proposal, error: lookupError } = await context.db.from("proposals").select("id,client_id").eq("id", proposalId).eq("client_id", context.user.id).maybeSingle();
  if (lookupError || !proposal) return jsonError("Proposal not found.", 404, "not_found");
  const { data: projectId, error } = await context.db.rpc("accept_proposal", { p_proposal_id: proposalId, p_client_id: context.user.id });
  if (error) return jsonError("This proposal is no longer available to accept.", 409, "proposal_unavailable");
  return Response.json({ projectId }, { status: 200, headers: { "Cache-Control": "private, no-store" } });
}
