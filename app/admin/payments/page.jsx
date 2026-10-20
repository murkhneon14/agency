import { redirect } from "next/navigation";
import { requireRole } from "../../../lib/auth/guards.js";
import { formatINRFromPaise } from "../../../lib/domain/finance.js";
import PaymentReview from "./PaymentReview.jsx";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const context = await requireRole(["ADMIN"]);
  if (context.error) redirect(context.status === 401 ? "/login" : "/auth/redirect");
  const { data: payments, error } = await context.db.from("payments").select("id,project_id,client_id,amount_paise,method,status,reference,note,created_at,projects(name)").order("created_at", { ascending: false });
  return <>
    <div className="portal-page-heading"><div><h1>Payment records</h1><p>Review manual payments submitted by clients. No online payment gateway is connected.</p></div></div>
    {error && <p className="portal-inline-error">Unable to load payment records.</p>}
    <section className="portal-panel"><div className="portal-panel-heading"><h2>All payments</h2><span>{payments?.length || 0} total</span></div>{payments?.length ? <div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Project</th><th>Amount</th><th>Method</th><th>Reference</th><th>Note</th><th>Submitted</th><th>Review</th></tr></thead><tbody>{payments.map((payment) => <tr key={payment.id}><td>{payment.projects?.name || "Project"}</td><td>{formatINRFromPaise(payment.amount_paise)}</td><td>{payment.method.replaceAll("_", " ")}</td><td>{payment.reference || "—"}</td><td>{payment.note || "—"}</td><td>{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(payment.created_at))}</td><td><PaymentReview paymentId={payment.id} status={payment.status} /></td></tr>)}</tbody></table></div> : <div className="portal-empty">No payment records have been submitted.</div>}</section>
  </>;
}
