import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireRole } from "../../../../lib/auth/guards.js";
import { formatINRFromPaise } from "../../../../lib/domain/finance.js";
import { MilestoneProgressEditor, TeamMemberAssignment } from "./ProjectControls.jsx";
import ProjectUpdateForm from "./ProjectUpdateForm.jsx";
import FileUploadForm from "../../../_portal/FileUploadForm.jsx";

export const dynamic = "force-dynamic";

export default async function AdminProjectDetails({ params }) {
  const context = await requireRole(["ADMIN"]);
  if (context.error) redirect(context.status === 401 ? "/login" : "/auth/redirect");
  const { projectId } = await params;
  const [projectResult, milestonesResult, memberResult, assignedResult, updatesResult] = await Promise.all([
    context.db.from("projects").select("*,profiles:profiles!projects_client_id_fkey(full_name)").eq("id", projectId).maybeSingle(),
    context.db.from("milestones").select("*").eq("project_id", projectId).order("sort_order"),
    context.db.from("profiles").select("id,full_name").eq("role", "TEAM_MEMBER").order("full_name"),
    context.db.from("project_members").select("profile_id,profiles:profiles!project_members_profile_id_fkey(full_name)").eq("project_id", projectId).eq("membership_role", "TEAM_MEMBER"),
    context.db.from("project_updates").select("id,title,body,visibility,created_at").eq("project_id", projectId).order("created_at", { ascending: false }),
  ]);
  const project = projectResult.data;
  if (!project) notFound();
  const assignedIds = (assignedResult.data || []).map((item) => item.profile_id);
  return <>
    <div className="portal-page-heading"><div><Link href="/admin/projects">← Projects</Link><h1>{project.name}</h1><p>{project.profiles?.full_name || "Client"} · {formatINRFromPaise(project.total_price_paise)}</p></div><span className={`portal-status portal-status--${project.status}`}>{project.status.replaceAll("_", " ")}</span></div>
    <section className="portal-panel"><div className="portal-panel-heading"><h2>Team members</h2><span>{assignedIds.length} assigned</span></div><div className="portal-panel-body">{assignedIds.length ? <div className="portal-actions">{assignedResult.data.map((item) => <span className="portal-status" key={item.profile_id}>{item.profiles?.full_name || item.profile_id}</span>)}</div> : <p className="portal-field-hint">No team members assigned yet.</p>}<TeamMemberAssignment projectId={project.id} members={memberResult.data || []} assignedIds={assignedIds} /></div></section>
    <section className="portal-panel"><div className="portal-panel-heading"><h2>Milestone progress</h2><span>{project.progress}% complete</span></div>{milestonesResult.data?.length ? milestonesResult.data.map((milestone) => <div className="portal-admin-milestone" key={milestone.id}><div className="portal-panel-heading"><strong>{milestone.sort_order}. {milestone.title}</strong><span>{formatINRFromPaise(milestone.price_paise)}</span></div><div className="portal-panel-body"><p>{milestone.description}</p><MilestoneProgressEditor projectId={project.id} milestone={milestone} /></div></div>) : <div className="portal-empty">No milestones recorded.</div>}</section>
    <section className="portal-panel"><div className="portal-panel-heading"><h2>Post an update or internal note</h2></div><ProjectUpdateForm projectId={project.id} /></section>
    <section className="portal-panel"><div className="portal-panel-heading"><h2>Upload a project file</h2></div><FileUploadForm projectId={project.id} staff /></section>
    <section className="portal-panel"><div className="portal-panel-heading"><h2>Activity posts</h2></div>{updatesResult.data?.length ? <div className="portal-panel-body portal-milestones">{updatesResult.data.map((update)=><article className="portal-milestone" key={update.id}><div><strong>{update.title}</strong><span className="portal-status">{update.visibility}</span><p>{update.body}</p></div><small>{new Intl.DateTimeFormat("en-IN",{dateStyle:"medium"}).format(new Date(update.created_at))}</small></article>)}</div> : <div className="portal-empty">No updates recorded.</div>}</section>
  </>;
}
