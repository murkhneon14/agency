import { requireRole } from "../../../../../lib/auth/guards.js";
import { jsonError, readJson, roleErrorResponse } from "../../../../../lib/http/responses.js";
import { clientPaymentSchema } from "../../../../../lib/validations/schemas.js";

export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  const context = await requireRole(["CLIENT"]);
  const denied = roleErrorResponse(context);
  if (denied) return denied;
  const { projectId } = await params;
  const body = await readJson(request);
  const parsed = clientPaymentSchema.safeParse({ ...body, projectId });
  if (!parsed.success) return jsonError("Enter a valid amount and payment reference.", 422, "validation_error");
  const { data: project, error: projectError } = await context.db.from("projects").select("id,client_id").eq("id", projectId).eq("client_id", context.user.id).maybeSingle();
  if (projectError || !project) return jsonError("Project not found.", 404, "not_found");
  const { data, error } = await context.db.from("payments").insert({
    project_id: project.id,
    client_id: context.user.id,
    amount_paise: parsed.data.amountPaise,
    status: "pending",
    method: parsed.data.method,
    reference: parsed.data.reference,
    note: parsed.data.note,
  }).select("id,status,amount_paise,created_at").single();
  if (error) return jsonError("Unable to record this payment. Check the amount or contact the agency.", 409, "payment_error");
  await context.db.from("audit_logs").insert({ actor_id: context.user.id, action: "payment.submitted", entity_type: "payment", entity_id: data.id });
  return Response.json({ payment: data }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
}
