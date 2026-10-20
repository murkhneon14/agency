import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "../../../lib/auth/guards.js";

export const dynamic = "force-dynamic";

export default async function ClientFilesPage() {
  const context = await requireRole(["CLIENT"]);
  if (context.error) redirect(context.status === 401 ? "/login" : "/auth/redirect");
  const { data: projects } = await context.db.from("projects").select("id").eq("client_id", context.user.id);
  const projectIds = (projects || []).map((item) => item.id);
  const { data: files, error } = projectIds.length ? await context.db.from("project_files").select("id,project_id,filename,category,size_bytes,created_at,projects(name)").eq("client_visible", true).in("project_id", projectIds).order("created_at", { ascending: false }) : { data: [], error: null };
  return <><div className="portal-page-heading"><div><h1>Files and deliverables</h1><p>Files shared with you across your projects.</p></div></div>{error&&<p className="portal-inline-error">Unable to load project files.</p>}<section className="portal-panel"><div className="portal-panel-heading"><h2>Shared files</h2><span>{files?.length||0} total</span></div>{files?.length?<div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>File</th><th>Project</th><th>Category</th><th>Size</th><th>Added</th><th></th></tr></thead><tbody>{files.map((file)=><tr key={file.id}><td>{file.filename}</td><td><Link href={`/dashboard/projects/${file.project_id}`}>{file.projects?.name||"Project"}</Link></td><td>{file.category}</td><td>{formatBytes(file.size_bytes)}</td><td>{date(file.created_at)}</td><td><a href={`/api/projects/${file.project_id}/files/${file.id}`}>Download</a></td></tr>)}</tbody></table></div>:<div className="portal-empty"><strong>No shared files</strong>Project files and deliverables will appear here when they are shared.</div>}</section></>;
}
function formatBytes(value) { return value < 1024 ? `${value} B` : `${Math.round(value / 1024)} KB`; }
function date(value) { return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value)); }
