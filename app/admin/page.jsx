import Link from "next/link";
import { requireRole } from "../../lib/auth/guards.js";
import { redirect } from "next/navigation";
import { formatINRFromPaise } from "../../lib/domain/finance.js";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const context = await requireRole(["ADMIN"]);
  if (context.error) redirect(context.status === 401 ? "/login" : "/auth/redirect");
  const [projectsResult, requestsResult, paymentsResult, clientsResult] = await Promise.all([
    context.db.from("projects").select("id,status,total_price_paise,created_at", { count: "exact" }),
    context.db.from("project_requests").select("id,status,created_at", { count: "exact" }).not("status", "in", "(accepted,declined,archived)"),
    context.db.from("payments").select("id,amount_paise,status,created_at").eq("status", "pending"),
    context.db.from("profiles").select("id", { count: "exact", head: true }).eq("role", "CLIENT"),
  ]);
  const openRequests = requestsResult.data?.length || 0;
  const pendingPayments = paymentsResult.data || [];
  const recentRequests = requestsResult.data || [];
  return <>
    <div className="portal-page-heading"><div><h1>Agency overview</h1><p>Requests, delivery, and manual payment review.</p></div><Link className="portal-button portal-button--primary" href="/admin/projects">Create project</Link></div>
    {(projectsResult.error || requestsResult.error || paymentsResult.error || clientsResult.error) && <p className="portal-inline-error">Some workspace counts could not be loaded.</p>}
    <section className="portal-grid">
      <Stat label="Projects" value={projectsResult.count ?? projectsResult.data?.length ?? 0} note="Across all client accounts" />
      <Stat label="Open requests" value={openRequests} note="Awaiting review or response" />
      <Stat label="Pending payments" value={pendingPayments.length} note={formatINRFromPaise(pendingPayments.reduce((sum, item) => sum + item.amount_paise, 0)) + " to review"} />
      <Stat label="Client accounts" value={clientsResult.count ?? 0} note="From verified profile records" />
    </section>
    <section className="portal-grid portal-grid--two">
      <div className="portal-panel"><div className="portal-panel-heading"><h2>Recent requests</h2><Link href="/admin/requests">Review requests</Link></div>{recentRequests.length ? <div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Request</th><th>Status</th><th>Received</th></tr></thead><tbody>{recentRequests.slice(0, 5).map((item) => <tr key={item.id}><td>{item.id.slice(0, 8).toUpperCase()}</td><td><Status value={item.status} /></td><td>{date(item.created_at)}</td></tr>)}</tbody></table></div> : <div className="portal-empty">No open requests right now.</div>}</div>
      <div className="portal-panel"><div className="portal-panel-heading"><h2>Payment reviews</h2><Link href="/admin/payments">Review payments</Link></div>{pendingPayments.length ? <div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Amount</th><th>Submitted</th></tr></thead><tbody>{pendingPayments.slice(0, 5).map((item) => <tr key={item.id}><td>{formatINRFromPaise(item.amount_paise)}</td><td>{date(item.created_at)}</td></tr>)}</tbody></table></div> : <div className="portal-empty">No pending payment records.</div>}</div>
    </section>
  </>;
}
function Stat({ label, value, note }) { return <article className="portal-stat"><div className="portal-stat-label">{label}</div><div className="portal-stat-value">{value}</div><div className="portal-stat-note">{note}</div></article>; }
function Status({ value }) { return <span className={`portal-status portal-status--${value}`}>{value.replaceAll("_", " ")}</span>; }
function date(value) { return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value)); }
