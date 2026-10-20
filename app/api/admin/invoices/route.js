import { requireRole } from "../../../../lib/auth/guards.js";
import { jsonError, readJson, roleErrorResponse } from "../../../../lib/http/responses.js";
import { invoiceCreateSchema } from "../../../../lib/validations/schemas.js";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const context = await requireRole(["ADMIN"]);
  const denied = roleErrorResponse(context);
  if (denied) return denied;
  const parsed = invoiceCreateSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError("Choose a project and valid milestone selection.", 422, "validation_error");
  const { data: invoiceId, error } = await context.db.rpc("create_invoice", {
    p_project_id: parsed.data.projectId,
    p_admin_id: context.user.id,
    p_due_date: parsed.data.dueDate || null,
    p_milestone_ids: parsed.data.milestoneIds,
  });
  if (error) return jsonError(error.message.includes("No unbilled") ? "There is no unbilled milestone balance for this project." : "Unable to create the invoice.", 409, "invoice_error");
  return Response.json({ invoiceId, href: `/api/invoices/${invoiceId}/pdf` }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
}
