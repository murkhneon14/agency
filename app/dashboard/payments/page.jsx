import { redirect } from "next/navigation";
import { requireRole } from "../../../lib/auth/guards.js";
import { formatINRFromPaise } from "../../../lib/domain/finance.js";
import PaymentSubmitForm from "./PaymentSubmitForm.jsx";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const context = await requireRole(["CLIENT"]);
  if (context.error) redirect(context.status === 401 ? "/login" : "/auth/redirect");
  const [projectsResult, paymentsResult] = await Promise.all([
    context.db.from("projects").select("id,name").eq("client_id", context.user.id).neq("status", "cancelled").order("created_at", { ascending: false }),
    context.db.from("payments").select("id,project_id,amount_paise,method,status,reference,created_at,projects(name)").eq("client_id", context.user.id).order("created_at", { ascending: false }),
  ]);
  return <>
    <div className="portal-page-heading"><div><h1>Payments</h1><p>Review recorded payments and submit a transfer for manual verification.</p></div></div>
    {projectsResult.data?.length ? <section className="portal-panel"><div className="portal-panel-heading"><h2>Record a payment you made</h2></div><PaymentSubmitForm projects={projectsResult.data} /></section> : <div className="portal-panel"><div className="portal-empty"><strong>No projects to pay for yet</strong>Payments will be available after a project is created.</div></div>}
    <section className="portal-panel"><div className="portal-panel-heading"><h2>Payment history</h2></div>{paymentsResult.error && <p className="portal-inline-error">Unable to load payment history.</p>}{paymentsResult.data?.length ? <div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Project</th><th>Amount</th><th>Method</th><th>Status</th><th>Reference</th><th>Submitted</th></tr></thead><tbody>{paymentsResult.data.map((payment) => <tr key={payment.id}><td>{payment.projects?.name || "Project"}</td><td>{formatINRFromPaise(payment.amount_paise)}</td><td>{payment.method.replaceAll("_", " ")}</td><td><span className={`portal-status portal-status--${payment.status}`}>{payment.status}</span></td><td>{payment.reference || "—"}</td><td>{date(payment.created_at)}</td></tr>)}</tbody></table></div> : <div className="portal-empty">No payments recorded for this account.</div>}</section>
  </>;
}
function date(value) { return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value)); }
