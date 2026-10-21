import { createAdminClient } from "../../../lib/supabase/admin.js";
import { jsonError, readJson } from "../../../lib/http/responses.js";
import { contactMessageSchema } from "../../../lib/validations/schemas.js";
import { notifyAdminsByEmail } from "../../../lib/email/notifications.js";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const parsed = contactMessageSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError("Check the contact form fields and try again.", 422, "validation_error");
  const { name, email, subject, message, website } = parsed.data;
  if (website) return Response.json({ accepted: true }, { status: 202 });
  try {
    const db = createAdminClient();
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count, error: countError } = await db.from("contact_messages").select("id", { count: "exact", head: true }).eq("email", email.toLowerCase()).gte("created_at", since);
    if (countError) return jsonError("Unable to accept this message right now.", 503, "service_unavailable");
    if ((count || 0) >= 3) return jsonError("Please wait a few minutes before sending another message.", 429, "rate_limited");
    const { error } = await db.from("contact_messages").insert({ name, email: email.toLowerCase(), subject, message });
    if (error) return jsonError("Unable to save this message. Please try again.", 503, "database_error");
    await notifyAdminsByEmail(db, {
      subject: `New contact message: ${subject}`,
      title: "New contact message received",
      body: `${name} sent a message through the public contact form.`,
      details: [
        { label: "Name", value: name },
        { label: "Email", value: email.toLowerCase() },
        { label: "Subject", value: subject },
        { label: "Message", value: message },
      ],
      href: "/admin/messages",
      actionLabel: "Open contact inbox",
    });
    return Response.json({ accepted: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    return jsonError("The contact form is not configured yet.", 503, "service_unavailable");
  }
}
