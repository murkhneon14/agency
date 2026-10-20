import Link from "next/link";
import { requireRole } from "../../lib/auth/guards.js";
import { redirect } from "next/navigation";
import { formatINRFromPaise } from "../../lib/domain/finance.js";

export const dynamic = "force-dynamic";

export default async function ClientDashboardPage() {
  const context = await requireRole(["CLIENT"]);
  if (context.error) redirect(context.status === 401 ? "/login" : "/auth/redirect");
  const { db, user } = context;
  const [projectsResult, requestsResult, paymentsResult] = await Promise.all([
    db.from("projects").select("id,name,status,progress,total_price_paise,expected_completion_date,created_at,milestones(id,title,due_date,work_status)").eq("client_id", user.id).order("created_at", { ascending: false }),
    db.from("project_requests").select("id,status", { count: "exact" }).eq("client_id", user.id),
    db.from("payments").select("amount_paise,status,created_at").eq("client_id", user.id).order("created_at", { ascending: false }),
  ]);
  const projects = projectsResult.data || [];
  const requests = requestsResult.data || [];
  const payments = paymentsResult.data || [];
  const verifiedPaid = payments.filter((item) => item.status === "verified").reduce((sum, item) => sum + item.amount_paise, 0);
  const projectBalance = projects.reduce((sum, project) => sum + project.total_price_paise, 0) - verifiedPaid;
  const activeCount = projects.filter((item) => ["active", "planning", "on_hold"].includes(item.status)).length;
  const upcoming = projects.flatMap((project) => (project.milestones || []).map((milestone) => ({ ...milestone, projectName: project.name, projectId: project.id })))
    .filter((item) => item.due_date && item.work_status !== "completed" && item.due_date >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => a.due_date.localeCompare(b.due_date)).slice(0, 4);

  return <>
    <div className="portal-page-heading"><div><h1>Overview</h1><p>Your project status and the latest account activity.</p></div><Link className="portal-button portal-button--primary" href="/dashboard/requests">Start a project request</Link></div>
    {(projectsResult.error || requestsResult.error || paymentsResult.error) && <p className="portal-inline-error">Some account information could not be loaded. Refresh to try again.</p>}
    <section className="portal-grid" aria-label="Project overview">
      <Stat label="Active projects" value={activeCount} note="Planning, active, or on hold" />
      <Stat label="Completed projects" value={projects.filter((item) => item.status === "completed").length} note="Based on recorded project status" />
      <Stat label="Open requests" value={requests.filter((item) => ["new", "reviewing", "proposal_sent"].includes(item.status)).length} note="Awaiting the next step" />
      <Stat label="Outstanding balance" value={formatINRFromPaise(Math.max(0, projectBalance))} note="Calculated from verified payments" />
    </section>
    <section className="portal-panel">
      <div className="portal-panel-heading"><h2>My projects</h2><Link href="/dashboard/projects">View all</Link></div>
      {projects.length === 0 ? <div className="portal-empty"><strong>No projects yet</strong>Submit a project request and the team will follow up with next steps.</div> : <div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Project</th><th>Status</th><th>Progress</th><th>Due date</th><th>Price</th></tr></thead><tbody>{projects.slice(0, 6).map((project) => <tr key={project.id}><td><Link href={`/dashboard/projects/${project.id}`}>{project.name}</Link><div className="portal-row-detail">{project.id.slice(0, 8).toUpperCase()}</div></td><td><Status value={project.status} /></td><td>{project.progress}%</td><td>{formatDate(project.expected_completion_date)}</td><td>{formatINRFromPaise(project.total_price_paise)}</td></tr>)}</tbody></table></div>}
    </section>
    <section className="portal-grid portal-grid--two">
      <div className="portal-panel"><div className="portal-panel-heading"><h2>Upcoming deadlines</h2></div>{upcoming.length ? <div className="portal-panel-body portal-milestones">{upcoming.map((item) => <div className="portal-milestone" key={item.id}><div><strong>{item.title}</strong><small>{item.projectName}</small></div><span>{formatDate(item.due_date)}</span></div>)}</div> : <div className="portal-empty">No upcoming milestones recorded.</div>}</div>
      <div className="portal-panel"><div className="portal-panel-heading"><h2>Recent payments</h2><Link href="/dashboard/payments">View all</Link></div>{payments.length ? <div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>{payments.slice(0, 4).map((payment, index) => <tr key={index}><td>{formatINRFromPaise(payment.amount_paise)}</td><td><Status value={payment.status} /></td><td>{formatDate(payment.created_at)}</td></tr>)}</tbody></table></div> : <div className="portal-empty">No payments recorded.</div>}</div>
    </section>
  </>;
}

function Stat({ label, value, note }) { return <article className="portal-stat"><div className="portal-stat-label">{label}</div><div className="portal-stat-value">{value}</div><div className="portal-stat-note">{note}</div></article>; }
function Status({ value }) { return <span className={`portal-status portal-status--${String(value).toLowerCase()}`}>{String(value).replaceAll("_", " ")}</span>; }
function formatDate(value) { return value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value)) : "Not set"; }
