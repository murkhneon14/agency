import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireRole } from "../../../../lib/auth/guards.js";
import { formatINRFromPaise } from "../../../../lib/domain/finance.js";
import { MilestoneFeedback, ProjectCommentForm } from "./ProjectFeedback.jsx";
import FileUploadForm from "../../../_portal/FileUploadForm.jsx";

export const dynamic = "force-dynamic";

export default async function ProjectDetailsPage({ params }) {
  const context = await requireRole(["CLIENT"]);
  if (context.error) redirect(context.status === 401 ? "/login" : "/auth/redirect");
  const { projectId } = await params;
  const { data: project, error } = await context.db.from("projects").select("*").eq("id", projectId).eq("client_id", context.user.id).maybeSingle();
  if (error || !project) notFound();
  const [milestonesResult, updatesResult, filesResult, paymentsResult, commentsResult] = await Promise.all([
    context.db.from("milestones").select("*").eq("project_id", project.id).order("sort_order"),
    context.db.from("project_updates").select("id,title,body,created_at,milestone_id").eq("project_id", project.id).eq("visibility", "client").order("created_at", { ascending: false }).limit(20),
    context.db.from("project_files").select("id,filename,category,size_bytes,created_at,milestone_id").eq("project_id", project.id).eq("client_visible", true).order("created_at", { ascending: false }),
    context.db.from("payments").select("id,amount_paise,status,reference,created_at").eq("project_id", project.id).eq("client_id", context.user.id).order("created_at", { ascending: false }),
    context.db.from("project_comments").select("id,body,comment_type,created_at,author_id").eq("project_id", project.id).eq("visibility", "client").order("created_at", { ascending: true }),
  ]);
  const milestones = milestonesResult.data || [];
  const payments = paymentsResult.data || [];
  const paid = payments.filter((payment) => payment.status === "verified").reduce((sum, payment) => sum + payment.amount_paise, 0);
  const currentMilestone = milestones.find((item) => item.work_status === "in_progress") || milestones.find((item) => item.work_status !== "completed");
  return <>
    <div className="portal-page-heading"><div><Link href="/dashboard/projects">← My projects</Link><h1>{project.name}</h1><p>{project.description || "Project overview and delivery progress."}</p></div><span className={`portal-status portal-status--${project.status}`}>{project.status.replaceAll("_", " ")}</span></div>
    <section className="portal-grid">
      <Stat label="Project price" value={formatINRFromPaise(project.total_price_paise)} />
      <Stat label="Verified payments" value={formatINRFromPaise(paid)} />
      <Stat label="Outstanding" value={formatINRFromPaise(Math.max(0, project.total_price_paise - paid))} />
      <Stat label="Progress" value={`${project.progress}%`} />
    </section>
    <section className="portal-panel"><div className="portal-panel-heading"><h2>Milestones</h2><span>{currentMilestone ? `Current: ${currentMilestone.title}` : "No active milestone"}</span></div><div className="portal-panel-body portal-milestones">{milestones.length ? milestones.map((item) => <article className="portal-milestone" key={item.id}><div><strong>{item.sort_order}. {item.title}</strong><small>{item.description || "Milestone details have not been added."} · Due {item.due_date ? date(item.due_date) : "not set"}</small><div className="portal-progress"><span style={{ width: `${item.work_percent}%` }} /></div><small>{item.work_percent}% complete · {formatINRFromPaise(item.paid_paise)} of {formatINRFromPaise(item.price_paise)} paid · Approval: {item.approval_status.replaceAll("_", " ")}</small><MilestoneFeedback projectId={project.id} milestoneId={item.id} workStatus={item.work_status} approvalStatus={item.approval_status} /></div><span className={`portal-status portal-status--${item.work_status}`}>{item.work_status.replaceAll("_", " ")}</span></article>) : <div className="portal-empty">No milestones have been added yet.</div>}</div></section>
    <section className="portal-grid portal-grid--two">
      <div className="portal-panel"><div className="portal-panel-heading"><h2>Project updates</h2></div>{updatesResult.data?.length ? <div className="portal-panel-body portal-milestones">{updatesResult.data.map((update) => <article className="portal-milestone" key={update.id}><div><strong>{update.title}</strong><small>{update.body}</small></div><small>{date(update.created_at)}</small></article>)}</div> : <div className="portal-empty">No client-visible updates yet.</div>}</div>
      <div className="portal-panel"><div className="portal-panel-heading"><h2>Files and deliverables</h2></div>{filesResult.data?.length ? <div className="portal-panel-body portal-milestones">{filesResult.data.map((file) => <div className="portal-milestone" key={file.id}><div><strong>{file.filename}</strong><small>{file.category} · {formatBytes(file.size_bytes)}</small></div><a href={`/api/projects/${project.id}/files/${file.id}`}>Download</a></div>)}</div> : <div className="portal-empty">No files available for this project yet.</div>}<FileUploadForm projectId={project.id} /></div>
    </section>
    <section className="portal-panel"><div className="portal-panel-heading"><h2>Payment history</h2><Link href="/dashboard/payments">Payments</Link></div>{payments.length ? <div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Amount</th><th>Status</th><th>Reference</th><th>Date</th></tr></thead><tbody>{payments.map((payment) => <tr key={payment.id}><td>{formatINRFromPaise(payment.amount_paise)}</td><td><span className={`portal-status portal-status--${payment.status}`}>{payment.status}</span></td><td>{payment.reference || "—"}</td><td>{date(payment.created_at)}</td></tr>)}</tbody></table></div> : <div className="portal-empty">No payments recorded for this project.</div>}</section>
    <section className="portal-panel"><div className="portal-panel-heading"><h2>Client comments</h2></div>{updatesResult.error && <p className="portal-inline-error">Unable to load project updates.</p>}{commentsResult.data?.length ? <div className="portal-panel-body portal-milestones">{commentsResult.data.map((comment) => <article className="portal-milestone" key={comment.id}><div><span className={`portal-status portal-status--${comment.comment_type}`}>{comment.comment_type.replaceAll("_", " ")}</span><p>{comment.body}</p></div><small>{date(comment.created_at)}</small></article>)}</div> : <div className="portal-empty">No comments yet.</div>}<ProjectCommentForm projectId={project.id} /></section>
  </>;
}
function Stat({ label, value }) { return <article className="portal-stat"><div className="portal-stat-label">{label}</div><div className="portal-stat-value">{value}</div></article>; }
function date(value) { return value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value)) : "—"; }
function formatBytes(value) { return value < 1024 ? `${value} B` : `${Math.round(value / 1024)} KB`; }
