import { redirect } from "next/navigation";
import { requireRole } from "../../../lib/auth/guards.js";
import RequestActions from "./RequestActions.jsx";
import Link from "next/link";

export const dynamic = "force-dynamic";

const budgetLabels = {
  "under-50k": "Under ₹50K",
  "50k-2l": "₹50K–₹2L",
  "2l-5l": "₹2L–₹5L",
  "5l-plus": "Above ₹5L",
  "not-sure": "Not sure yet",
};

const timelineLabels = {
  asap: "ASAP",
  "1-2-months": "1–2 months",
  "3-6-months": "3–6 months",
  flexible: "Flexible",
};

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
    <section className="portal-panel">
      <div className="portal-panel-heading">
        <h2>All requests</h2>
        <span>{requests?.length || 0} total</span>
      </div>
      {requests?.length ? <div className="portal-table-wrap portal-request-table-wrap">
        <table className="portal-table portal-request-table">
          <thead>
            <tr>
              <th scope="col">Client</th>
              <th scope="col">Service</th>
              <th scope="col">Budget</th>
              <th scope="col">Timeline</th>
              <th scope="col">Submitted</th>
              <th scope="col">Status</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>{requests.map((item) => <tr key={item.id}>
            <td data-label="Client">
              <div className="portal-request-client">
                <strong>{names.get(item.client_id) || item.name}</strong>
                <span className="portal-row-detail">{item.email}</span>
                <span className="portal-request-id">Request #{item.id.slice(0, 8).toUpperCase()}</span>
              </div>
            </td>
            <td className="portal-request-service" data-label="Service">{item.service}</td>
            <td className="portal-request-nowrap" data-label="Budget">{budgetLabels[item.budget] || item.budget.replaceAll("-", " ")}</td>
            <td className="portal-request-nowrap" data-label="Timeline">{timelineLabels[item.timeline] || item.timeline.replaceAll("-", " ")}</td>
            <td className="portal-request-nowrap" data-label="Submitted">{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(item.submitted_at))}</td>
            <td className="portal-request-status-cell" data-label="Status"><RequestActions requestId={item.id} status={item.status} clientName={names.get(item.client_id) || item.name} /></td>
            <td className="portal-request-action-cell" data-label="Action"><Link className="portal-button portal-button--secondary portal-request-action-button" href={`/admin/proposals/new?requestId=${item.id}`}>Create proposal</Link></td>
          </tr>)}</tbody>
        </table>
      </div> : <div className="portal-empty">No requests have been submitted.</div>}
    </section>
  </>;
}
