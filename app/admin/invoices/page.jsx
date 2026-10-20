import { redirect } from "next/navigation";
import { requireRole } from "../../../lib/auth/guards.js";
import { formatINRFromPaise } from "../../../lib/domain/finance.js";
import InvoiceCreateForm from "./InvoiceCreateForm.jsx";

export const dynamic = "force-dynamic";

export default async function AdminInvoicesPage() {
  const context = await requireRole(["ADMIN"]);
  if (context.error) redirect(context.status === 401 ? "/login" : "/auth/redirect");
  const [projectsResult, invoicesResult] = await Promise.all([
    context.db.from("projects").select("id,name").neq("status","cancelled").order("created_at", { ascending: false }),
    context.db.from("invoices").select("id,invoice_number,project_id,status,total_paise,due_date,created_at,projects(name)").order("created_at", { ascending: false }),
  ]);
  return <><div className="portal-page-heading"><div><h1>Invoices</h1><p>Issue invoices for unbilled milestone balances and download PDFs.</p></div></div><section className="portal-panel"><div className="portal-panel-heading"><h2>Create invoice</h2></div><InvoiceCreateForm projects={projectsResult.data || []} /></section><section className="portal-panel"><div className="portal-panel-heading"><h2>All invoices</h2><span>{invoicesResult.data?.length || 0} total</span></div>{invoicesResult.error&&<p className="portal-inline-error">Unable to load invoices.</p>}{invoicesResult.data?.length?<div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Invoice</th><th>Project</th><th>Amount</th><th>Status</th><th>Due</th><th>PDF</th></tr></thead><tbody>{invoicesResult.data.map((invoice)=><tr key={invoice.id}><td>{invoice.invoice_number}</td><td>{invoice.projects?.name||"Project"}</td><td>{formatINRFromPaise(invoice.total_paise)}</td><td>{invoice.status}</td><td>{invoice.due_date||"—"}</td><td><a href={`/api/invoices/${invoice.id}/pdf`}>Download</a></td></tr>)}</tbody></table></div>:<div className="portal-empty">No invoices have been created.</div>}</section></>;
}
