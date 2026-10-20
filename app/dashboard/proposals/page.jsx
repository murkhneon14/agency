import { redirect } from "next/navigation";
import { requireRole } from "../../../lib/auth/guards.js";
import { formatINRFromPaise } from "../../../lib/domain/finance.js";
import ProposalAcceptButton from "./ProposalAcceptButton.jsx";
import ProposalDeclineButton from "./ProposalDeclineButton.jsx";

export const dynamic = "force-dynamic";

export default async function ProposalsPage() {
  const context = await requireRole(["CLIENT"]);
  if (context.error) redirect(context.status === 401 ? "/login" : "/auth/redirect");
  const { data, error } = await context.db.from("proposals").select("id,title,description,total_price_paise,status,version,expires_at,created_at,proposal_milestones(id,sort_order,title,description,price_paise,due_date)").eq("client_id", context.user.id).order("created_at", { ascending: false });
  return <>
    <div className="portal-page-heading"><div><h1>Proposals</h1><p>Review the scope, configurable milestones, and agreed price before accepting.</p></div></div>
    {error && <p className="portal-inline-error">Unable to load proposals.</p>}
    {!data?.length ? <section className="portal-panel"><div className="portal-empty"><strong>No proposals yet</strong>When the team prepares a project proposal, it will appear here.</div></section> : data.map((proposal) => <section className="portal-panel" key={proposal.id}>
      <div className="portal-panel-heading"><div><h2>{proposal.title}</h2><span className={`portal-status portal-status--${proposal.status}`}>{proposal.status}</span></div><strong>{formatINRFromPaise(proposal.total_price_paise)}</strong></div>
      <div className="portal-panel-body"><p>{proposal.description || "Review the milestone plan below."}</p><div className="portal-milestones">{proposal.proposal_milestones.sort((a,b) => a.sort_order-b.sort_order).map((milestone) => <article className="portal-milestone" key={milestone.id}><div><strong>{milestone.sort_order}. {milestone.title}</strong><small>{milestone.description || ""}{milestone.due_date ? ` · Due ${milestone.due_date}` : ""}</small></div><strong>{formatINRFromPaise(milestone.price_paise)}</strong></article>)}</div>
        {proposal.status === "sent" && <div className="portal-actions" style={{ marginTop: 16 }}><ProposalAcceptButton proposalId={proposal.id} /><ProposalDeclineButton proposalId={proposal.id} /><span className="portal-field-hint">Acceptance creates a project and copies these milestones.</span></div>}
      </div>
    </section>)}
  </>;
}
