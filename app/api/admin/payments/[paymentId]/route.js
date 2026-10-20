import { requireRole } from "../../../../../lib/auth/guards.js";
import { jsonError, readJson, roleErrorResponse } from "../../../../../lib/http/responses.js";
import { paymentReviewSchema } from "../../../../../lib/validations/schemas.js";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  const context = await requireRole(["ADMIN"]);
  const denied = roleErrorResponse(context);
  if (denied) return denied;
  const { paymentId } = await params;
  const parsed = paymentReviewSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError("Choose a valid review outcome.", 422, "validation_error");
  const { error } = await context.db.rpc("review_payment", {
    p_payment_id: paymentId,
    p_admin_id: context.user.id,
    p_status: parsed.data.status,
    p_admin_note: parsed.data.adminNote,
  });
  if (error) return jsonError(error.message.includes("outstanding balance") ? "This payment exceeds the remaining project balance." : "Unable to review this payment. It may already have been reviewed.", 409, "payment_review_error");
  return Response.json({ paymentId, status: parsed.data.status }, { headers: { "Cache-Control": "private, no-store" } });
}
