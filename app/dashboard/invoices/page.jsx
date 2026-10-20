import { redirect } from "next/navigation";
import { requireRole } from "../../../lib/auth/guards.js";
import { formatINRFromPaise } from "../../../lib/domain/finance.js";

export const dynamic = "force-dynamic";

export default async function ClientInvoicesPage() {
  const context = await requireRole(["CLIENT"]);
  if (context.error) redirect(context.status === 401 ? "/login" : "/auth/redirect");
  const { data, error } = await context.db.from("invoices").select("id,invoice_number,project_id,status,total_paise,due_date,issued_at,projects(name)").eq("client_id", context.user.id).order("created_at", { ascending: false });
  return <><div className="portal-page-heading"><div><h1>Invoices</h1><p>Issued invoices and downloadable PDF copies.</p></div></div>{error&&<p className="portal-inline-error">Unable to load invoices.</p>}<section className="portal-panel"><div className="portal-panel-heading"><h2>Invoice history</h2></div>{data?.length?<div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Invoice</th><th>Project</th><th>Amount</th><th>Status</th><th>Due</th><th>PDF</th></tr></thead><tbody>{data.map((invoice)=><tr key={invoice.id}><td>{invoice.invoice_number}</td><td>{invoice.projects?.name||"Project"}</td><td>{formatINRFromPaise(invoice.total_paise)}</td><td><span className={`portal-status portal-status--${invoice.status}`}>{invoice.status.replaceAll("_"," ")}</span></td><td>{invoice.due_date||"—"}</td><td><a href={`/api/invoices/${invoice.id}/pdf`}>Download PDF</a></td></tr>)}</tbody></table></div>:<div className="portal-empty">No invoices have been issued for your account.</div>}</section></>;
}
