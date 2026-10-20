import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { requireRole } from "../../../../../lib/auth/guards.js";
import { jsonError, roleErrorResponse } from "../../../../../lib/http/responses.js";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const context = await requireRole(["CLIENT", "ADMIN"]);
  const denied = roleErrorResponse(context);
  if (denied) return denied;
  const { invoiceId } = await params;
  let query = context.db.from("invoices").select("*,projects(name,client_id)").eq("id", invoiceId);
  if (context.profile.role === "CLIENT") query = query.eq("client_id", context.user.id);
  const { data: invoice, error } = await query.maybeSingle();
  if (error || !invoice) return jsonError("Invoice not found.", 404, "not_found");
  const [itemsResult, profileResult, allocationsResult] = await Promise.all([
    context.db.from("invoice_items").select("description,quantity,unit_price_paise,total_paise").eq("invoice_id", invoice.id).order("created_at"),
    context.db.from("profiles").select("full_name,company").eq("id", invoice.client_id).maybeSingle(),
    context.db.from("invoice_payment_allocations").select("amount_paise").eq("invoice_id", invoice.id),
  ]);
  if (itemsResult.error) return jsonError("Unable to build the invoice.", 500, "database_error");
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(0.09, 0.12, 0.19);
  const muted = rgb(0.38, 0.42, 0.49);
  const left = 48;
  let y = 790;
  page.drawText("8bitbrains", { x: left, y, size: 19, font: bold, color: ink });
  page.drawText("INVOICE", { x: 420, y, size: 19, font: bold, color: rgb(0.36, 0.31, 0.82) });
  y -= 34;
  page.drawText(invoice.invoice_number, { x: 420, y, size: 10, font: regular, color: muted });
  page.drawText(`Issued ${formatDate(invoice.issued_at || invoice.created_at)}`, { x: left, y, size: 10, font: regular, color: muted });
  y -= 46;
  page.drawText("Bill to", { x: left, y, size: 10, font: bold, color: muted });
  page.drawText(pdfText(profileResult.data?.full_name || "Client"), { x: left, y: y - 17, size: 12, font: bold, color: ink });
  if (profileResult.data?.company) page.drawText(pdfText(profileResult.data.company), { x: left, y: y - 34, size: 10, font: regular, color: muted });
  page.drawText(pdfText(`Project: ${invoice.projects?.name || "Project"}`), { x: 300, y: y - 17, size: 10, font: regular, color: ink });
  page.drawText(`Due: ${invoice.due_date ? formatDate(invoice.due_date) : "On receipt"}`, { x: 300, y: y - 34, size: 10, font: regular, color: ink });
  y -= 82;
  page.drawRectangle({ x: left, y: y - 8, width: 499, height: 26, color: rgb(0.96, 0.97, 0.99) });
  page.drawText("DESCRIPTION", { x: left + 9, y, size: 9, font: bold, color: muted });
  page.drawText("QTY", { x: 362, y, size: 9, font: bold, color: muted });
  page.drawText("AMOUNT", { x: 464, y, size: 9, font: bold, color: muted });
  y -= 30;
  for (const item of itemsResult.data || []) {
    if (y < 145) break;
    page.drawText(pdfText(truncate(item.description, 54)), { x: left + 9, y, size: 10, font: regular, color: ink });
    page.drawText(String(item.quantity), { x: 366, y, size: 10, font: regular, color: ink });
    page.drawText(formatINR(item.total_paise), { x: 448, y, size: 10, font: regular, color: ink });
    y -= 25;
  }
  const paid = (allocationsResult.data || []).reduce((sum, item) => sum + item.amount_paise, 0);
  y -= 18;
  page.drawLine({ start: { x: 340, y }, end: { x: 547, y }, thickness: 1, color: rgb(0.88, 0.9, 0.93) });
  y -= 23;
  page.drawText("Subtotal", { x: 355, y, size: 10, font: regular, color: muted });
  page.drawText(formatINR(invoice.subtotal_paise), { x: 448, y, size: 10, font: regular, color: ink });
  y -= 19;
  page.drawText("Tax", { x: 355, y, size: 10, font: regular, color: muted });
  page.drawText(formatINR(invoice.tax_paise), { x: 448, y, size: 10, font: regular, color: ink });
  y -= 22;
  page.drawText("Total", { x: 355, y, size: 12, font: bold, color: ink });
  page.drawText(formatINR(invoice.total_paise), { x: 448, y, size: 12, font: bold, color: ink });
  y -= 20;
  page.drawText("Paid", { x: 355, y, size: 10, font: regular, color: muted });
  page.drawText(formatINR(paid), { x: 448, y, size: 10, font: regular, color: ink });
  y -= 19;
  page.drawText("Balance due", { x: 355, y, size: 11, font: bold, color: ink });
  page.drawText(formatINR(Math.max(0, invoice.total_paise - paid)), { x: 448, y, size: 11, font: bold, color: ink });
  page.drawText("Manual payment tracking · Contact the agency if you have questions about this invoice.", { x: left, y: 42, size: 9, font: regular, color: muted });
  const bytes = await pdf.save();
  return new Response(bytes, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${invoice.invoice_number}.pdf"`, "Cache-Control": "private, no-store" } });
}

function formatINR(paise) { return `INR ${(Number(paise || 0) / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function formatDate(value) { return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(value)); }
function truncate(value, max) { return value.length > max ? `${value.slice(0, max - 1)}…` : value; }
function pdfText(value) { return String(value).normalize("NFKD").replace(/[^\x20-\x7E]/g, "?"); }
