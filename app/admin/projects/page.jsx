import { redirect } from "next/navigation";
import { requireRole } from "../../../lib/auth/guards.js";
import { formatINRFromPaise } from "../../../lib/domain/finance.js";
import ProjectCreateForm from "./ProjectCreateForm.jsx";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const context = await requireRole(["ADMIN"]);
  if (context.error) redirect(context.status === 401 ? "/login" : "/auth/redirect");
  const [projectsResult, clientsResult] = await Promise.all([
    context.db.from("projects").select("id,name,status,progress,total_price_paise,client_id,expected_completion_date,created_at").order("created_at", { ascending: false }),
    context.db.from("profiles").select("id,full_name").eq("role", "CLIENT").order("full_name"),
  ]);
  const names = new Map((clientsResult.data || []).map((item) => [item.id, item.full_name]));
  return <>
    <div className="portal-page-heading"><div><h1>Projects</h1><p>Create projects with configurable milestones and review project status.</p></div></div>
    <section className="portal-panel"><div className="portal-panel-heading"><h2>Create a project</h2></div><ProjectCreateForm clients={clientsResult.data || []} /></section>
    <section className="portal-panel"><div className="portal-panel-heading"><h2>All projects</h2><span>{projectsResult.data?.length || 0} total</span></div>{projectsResult.error && <p className="portal-inline-error">Unable to load projects.</p>}{projectsResult.data?.length ? <div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Project</th><th>Client</th><th>Status</th><th>Progress</th><th>Price</th><th>Deadline</th></tr></thead><tbody>{projectsResult.data.map((project) => <tr key={project.id}><td><Link href={`/admin/projects/${project.id}`}>{project.name}</Link><div className="portal-row-detail">{project.id.slice(0, 8).toUpperCase()}</div></td><td>{names.get(project.client_id) || "Client"}</td><td><span className={`portal-status portal-status--${project.status}`}>{project.status.replaceAll("_", " ")}</span></td><td>{project.progress}%</td><td>{formatINRFromPaise(project.total_price_paise)}</td><td>{project.expected_completion_date || "—"}</td></tr>)}</tbody></table></div> : <div className="portal-empty">No projects have been created.</div>}</section>
  </>;
}
