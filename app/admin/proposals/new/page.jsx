import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireRole } from "../../../../lib/auth/guards.js";
import ProposalCreateForm from "../ProposalCreateForm.jsx";

export const dynamic = "force-dynamic";

export default async function NewProposalPage({ searchParams }) {
  const context = await requireRole(["ADMIN"]);
  if (context.error) redirect(context.status === 401 ? "/login" : "/auth/redirect");
  const params = await searchParams;
  const requestId = params.requestId;
  if (!requestId) notFound();
  const { data: projectRequest } = await context.db.from("project_requests").select("id,name,service,description,status,client_id").eq("id", requestId).maybeSingle();
  if (!projectRequest) notFound();
  return <>
    <div className="portal-page-heading"><div><Link href="/admin/requests">← Requests</Link><h1>Create proposal</h1><p>For {projectRequest.name} · {projectRequest.service} · {projectRequest.status}</p></div></div>
    <section className="portal-panel"><div className="portal-panel-heading"><h2>Request brief</h2><span>{projectRequest.id}</span></div><div className="portal-panel-body">{projectRequest.description}</div></section>
    <section className="portal-panel"><div className="portal-panel-heading"><h2>Proposal scope and price</h2></div><ProposalCreateForm requestId={projectRequest.id} suggestedTitle={`${projectRequest.service} project`} /></section>
  </>;
}
