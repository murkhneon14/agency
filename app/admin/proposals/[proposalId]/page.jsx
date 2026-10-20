import Link from "next/link";
import { notFound,redirect } from "next/navigation";
import { requireRole } from "../../../../lib/auth/guards.js";
import { formatINRFromPaise } from "../../../../lib/domain/finance.js";
import ProposalRevisionForm from "../ProposalRevisionForm.jsx";

export const dynamic="force-dynamic";
export default async function ReviseProposalPage({params}){
  const context=await requireRole(["ADMIN"]);if(context.error)redirect(context.status===401?"/login":"/auth/redirect");const {proposalId}=await params;
  const {data:proposal}=await context.db.from("proposals").select("id,title,description,total_price_paise,status,version,expires_at,client_id,proposal_milestones(id,sort_order,title,description,price_paise,due_date)").eq("id",proposalId).maybeSingle();if(!proposal)notFound();if(!["draft","sent"].includes(proposal.status))notFound();
  const {data:client}=await context.db.from("profiles").select("full_name").eq("id",proposal.client_id).maybeSingle();
  return <><div className="portal-page-heading"><div><Link href="/admin/proposals">← Proposals</Link><h1>Revise proposal</h1><p>{client?.full_name||"Client"} · Current total {formatINRFromPaise(proposal.total_price_paise)} · Version {proposal.version}</p></div></div><section className="portal-panel"><div className="portal-panel-heading"><h2>Update proposal scope</h2></div><ProposalRevisionForm proposal={proposal} /></section></>;
}
