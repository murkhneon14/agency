import { redirect } from "next/navigation";
import { requireRole } from "../../../lib/auth/guards.js";
import ProjectRequestForm from "./ProjectRequestForm.jsx";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const context = await requireRole(["CLIENT"]);
  if (context.error) redirect(context.status === 401 ? "/login" : "/auth/redirect");
  const { data, error } = await context.db.from("project_requests").select("id,service,status,submitted_at,description").eq("client_id", context.user.id).order("submitted_at", { ascending: false });
  return <>
    <div className="portal-page-heading"><div><h1>Project requests</h1><p>Tell us what you need. We’ll review your brief and reply with next steps.</p></div></div>
    <section className="portal-panel"><div className="portal-panel-heading"><h2>New project request</h2></div><ProjectRequestForm profile={context.profile} email={context.user.email} /></section>
    <section className="portal-panel"><div className="portal-panel-heading"><h2>Previous requests</h2><span>{data?.length || 0} total</span></div>
      {error && <p className="portal-inline-error">Unable to load request history.</p>}
      {!data?.length ? <div className="portal-empty">Your submitted requests will appear here.</div> : <div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Service</th><th>Status</th><th>Submitted</th><th>Summary</th></tr></thead><tbody>{data.map((item) => <tr key={item.id}><td>{item.service}</td><td><span className={`portal-status portal-status--${item.status}`}>{item.status.replaceAll("_", " ")}</span></td><td>{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(item.submitted_at))}</td><td>{item.description.slice(0, 110)}{item.description.length > 110 ? "…" : ""}</td></tr>)}</tbody></table></div>}
    </section>
  </>;
}
