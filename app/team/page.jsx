import { requireRole } from "../../lib/auth/guards.js";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TeamHome() {
  const context = await requireRole(["TEAM_MEMBER"]);
  if (context.error) redirect(context.status === 401 ? "/login" : "/auth/redirect");
  const { data: memberships, error } = await context.db.from("project_members").select("project_id,projects(id,name,status,progress,expected_completion_date,client_id)").eq("profile_id", context.user.id).eq("membership_role", "TEAM_MEMBER");
  const assigned = (memberships || []).map((item) => item.projects).filter(Boolean);
  return <><div className="portal-page-heading"><div><h1>Team workspace</h1><p>Projects assigned to your team account.</p></div></div>{error && <p className="portal-inline-error">Unable to load assigned projects.</p>}<section className="portal-panel"><div className="portal-panel-heading"><h2>Assigned projects</h2><span>{assigned.length} total</span></div>{assigned.length ? <div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Project</th><th>Status</th><th>Progress</th><th>Deadline</th></tr></thead><tbody>{assigned.map((project) => <tr key={project.id}><td>{project.name}</td><td>{project.status}</td><td>{project.progress}%</td><td>{project.expected_completion_date || "—"}</td></tr>)}</tbody></table></div> : <div className="portal-empty"><strong>No projects assigned</strong>Ask an administrator to add you to a project.</div>}</section></>;
}
