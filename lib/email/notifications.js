import "server-only";
import { sendBrevoEmail } from "./brevo.js";

function escapeHtml(value) {
  return String(value ?? "—")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getActionUrl(path) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!appUrl || typeof path !== "string" || !path.startsWith("/") || path.startsWith("//")) return null;
  try {
    const baseUrl = new URL(appUrl);
    if (!new Set(["http:", "https:"]).has(baseUrl.protocol)) return null;
    return new URL(path, baseUrl).toString();
  } catch {
    return null;
  }
}

function buildEmail({ recipientName, title, body, details = [], href, actionLabel }) {
  const rows = details.map(({ label, value }) => `
    <tr>
      <th align="left" style="padding:8px 12px 8px 0;color:#475569;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</th>
      <td style="padding:8px 0;color:#0f172a;white-space:pre-wrap">${escapeHtml(value)}</td>
    </tr>`).join("");
  const actionUrl = getActionUrl(href);
  const greeting = recipientName ? `Hello ${recipientName},` : "Hello,";
  const actionText = actionUrl ? `\n\n${actionLabel || "Open the portal"}: ${actionUrl}` : "";
  const textDetails = details.map(({ label, value }) => `${label}: ${value ?? "—"}`).join("\n");
  const textContent = `${greeting}\n\n${title}\n${body}${textDetails ? `\n\n${textDetails}` : ""}${actionText}`;
  const htmlContent = `<!doctype html><html><body style="margin:0;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a">
    <main style="max-width:640px;margin:24px auto;padding:28px;background:#fff;border:1px solid #e2e8f0;border-radius:12px">
      <p style="margin:0 0 16px">${escapeHtml(greeting)}</p>
      <h1 style="font-size:22px;margin:0 0 12px">${escapeHtml(title)}</h1>
      <p style="line-height:1.6;margin:0 0 20px;white-space:pre-wrap">${escapeHtml(body)}</p>
      ${rows ? `<table style="border-collapse:collapse;width:100%;margin:0 0 24px">${rows}</table>` : ""}
      ${actionUrl ? `<p style="margin:0"><a href="${escapeHtml(actionUrl)}" style="display:inline-block;padding:11px 16px;background:#111827;color:#fff;text-decoration:none;border-radius:7px">${escapeHtml(actionLabel || "Open the portal")}</a></p>` : ""}
    </main>
  </body></html>`;

  return { textContent, htmlContent };
}

function normalizeRecipients(recipients) {
  const uniqueRecipients = new Map();
  for (const recipient of recipients) {
    const email = recipient?.email?.trim();
    if (!email) continue;
    const key = email.toLowerCase();
    if (!uniqueRecipients.has(key)) uniqueRecipients.set(key, { email, name: recipient.name?.trim() || undefined });
  }
  return [...uniqueRecipients.values()];
}

async function deliverNotification(recipients, notification) {
  const to = normalizeRecipients(recipients);
  if (!to.length) return { sent: 0, skipped: "no_recipients" };
  const email = buildEmail({ ...notification, recipientName: to.length === 1 ? to[0].name : undefined });
  return sendBrevoEmail({ to, subject: notification.subject, ...email });
}

export async function notifyAdminsByEmail(db, notification) {
  try {
    const { data, error } = await db.from("profiles").select("email,full_name").eq("role", "ADMIN");
    if (error) console.error("Unable to load admin email recipients.");
    const recipients = (data || []).map((profile) => ({ email: profile.email, name: profile.full_name }));
    const fallbackAddresses = process.env.ADMIN_NOTIFICATION_EMAIL?.split(",") || [];
    recipients.push(...fallbackAddresses.map((email) => ({ email: email.trim(), name: "Admin" })));
    return await deliverNotification(recipients, notification);
  } catch (error) {
    console.error("Unable to send admin notification email.", error instanceof Error ? error.message : "Unknown error");
    return { sent: 0, failed: 1 };
  }
}

export async function notifyClientByEmail(db, profileId, notification) {
  try {
    const { data: profile, error } = await db.from("profiles").select("email,full_name").eq("id", profileId).maybeSingle();
    if (error || !profile?.email) {
      if (error) console.error("Unable to load client email recipient.");
      return { sent: 0, skipped: "no_recipient" };
    }
    return await deliverNotification([{ email: profile.email, name: profile.full_name }], notification);
  } catch (error) {
    console.error("Unable to send client notification email.", error instanceof Error ? error.message : "Unknown error");
    return { sent: 0, failed: 1 };
  }
}
