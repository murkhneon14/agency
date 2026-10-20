import { redirect } from "next/navigation";
import { requireRole } from "../../../lib/auth/guards.js";
import RequestActions from "./RequestActions.jsx";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminRequestsPage() {
  const context = await requireRole(["ADMIN"]);
  if (context.error) redirect(context.status === 401 ? "/login" : "/auth/redirect");
  const { data: requests, error } = await context.db.from("project_requests").select("*").order("submitted_at", { ascending: false });
  const ids = [...new Set((requests || []).map((item) => item.client_id))];
  const { data: clients } = ids.length ? await context.db.from("profiles").select("id,full_name").in("id", ids) : { data: [] };
  const names = new Map((clients || []).map((item) => [item.id, item.full_name]));
  return <>
    <div className="portal-page-heading"><div><h1>Project requests</h1><p>Review inbound requests and update their status.</p></div></div>
    {error && <p className="portal-inline-error">Unable to load requests.</p>}
    <section className="portal-panel"><div className="portal-panel-heading"><h2>All requests</h2><span>{requests?.length || 0} total</span></div>{requests?.length ? <div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Client</th><th>Service</th><th>Budget</th><th>Timeline</th><th>Submitted</th><th>Status</th><th>Action</th></tr></thead><tbody>{requests.map((item) => <tr key={item.id}><td>{names.get(item.client_id) || item.name}<div className="portal-row-detail">{item.email}</div><div className="portal-row-detail">{item.id}</div></td><td>{item.service}</td><td>{item.budget.replaceAll("-", " ")}</td><td>{item.timeline.replaceAll("-", " ")}</td><td>{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(item.submitted_at))}</td><td><RequestActions requestId={item.id} status={item.status} /></td><td><Link className="portal-button portal-button--secondary" href={`/admin/proposals/new?requestId=${item.id}`}>Create proposal</Link></td></tr>)}</tbody></table></div> : <div className="portal-empty">No requests have been submitted.</div>}</section>
  </>;
}
