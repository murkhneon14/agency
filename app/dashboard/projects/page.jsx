import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "../../../lib/auth/guards.js";
import { formatINRFromPaise } from "../../../lib/domain/finance.js";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const context = await requireRole(["CLIENT"]);
  if (context.error) redirect(context.status === 401 ? "/login" : "/auth/redirect");
  const { data, error } = await context.db.from("projects").select("id,name,status,progress,total_price_paise,start_date,expected_completion_date").eq("client_id", context.user.id).order("created_at", { ascending: false });
  const projects = data || [];
  return <>
    <div className="portal-page-heading"><div><h1>My projects</h1><p>Projects assigned to your account.</p></div><Link className="portal-button portal-button--primary" href="/dashboard/requests">Submit a request</Link></div>
    {error && <p className="portal-inline-error">Could not load your projects. Refresh to try again.</p>}
    <section className="portal-panel"><div className="portal-panel-heading"><h2>All projects</h2><span>{projects.length} total</span></div>
      {projects.length === 0 ? <div className="portal-empty"><strong>No projects yet</strong>Your accepted proposals will appear here.</div> : <div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Project</th><th>Status</th><th>Progress</th><th>Start date</th><th>Expected completion</th><th>Price</th></tr></thead><tbody>{projects.map((project) => <tr key={project.id}><td><Link href={`/dashboard/projects/${project.id}`}>{project.name}</Link></td><td><span className={`portal-status portal-status--${project.status}`}>{project.status.replaceAll("_", " ")}</span></td><td>{project.progress}%</td><td>{date(project.start_date)}</td><td>{date(project.expected_completion_date)}</td><td>{formatINRFromPaise(project.total_price_paise)}</td></tr>)}</tbody></table></div>}
    </section>
  </>;
}
function date(value) { return value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value)) : "—"; }
