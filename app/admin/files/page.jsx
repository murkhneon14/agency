import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "../../../lib/auth/guards.js";

export const dynamic = "force-dynamic";

export default async function AdminFilesPage() {
  const context = await requireRole(["ADMIN"]);
  if (context.error) redirect(context.status === 401 ? "/login" : "/auth/redirect");
  const { data, error } = await context.db.from("project_files").select("id,project_id,filename,category,size_bytes,client_visible,created_at,projects(name)").order("created_at", { ascending: false });
  return <><div className="portal-page-heading"><div><h1>Project files</h1><p>Private files uploaded to client projects.</p></div></div>{error&&<p className="portal-inline-error">Unable to load project files.</p>}<section className="portal-panel"><div className="portal-panel-heading"><h2>All files</h2><span>{data?.length||0} total</span></div>{data?.length?<div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>File</th><th>Project</th><th>Category</th><th>Visibility</th><th>Size</th><th>Added</th><th></th></tr></thead><tbody>{data.map((file)=><tr key={file.id}><td>{file.filename}</td><td><Link href={`/admin/projects/${file.project_id}`}>{file.projects?.name||"Project"}</Link></td><td>{file.category}</td><td>{file.client_visible?"Client visible":"Internal"}</td><td>{formatBytes(file.size_bytes)}</td><td>{date(file.created_at)}</td><td><a href={`/api/projects/${file.project_id}/files/${file.id}`}>Download</a></td></tr>)}</tbody></table></div>:<div className="portal-empty">No files have been uploaded.</div>}</section></>;
}
function formatBytes(value) { return value < 1024 ? `${value} B` : `${Math.round(value / 1024)} KB`; }
function date(value) { return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value)); }
