import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "../../../lib/auth/guards.js";

export const dynamic="force-dynamic";
export default async function AdminProposalsPage(){
  const context=await requireRole(["ADMIN"]);if(context.error)redirect(context.status===401?"/login":"/auth/redirect");
  const {data,error}=await context.db.from("proposals").select("id,request_id,client_id,title,total_price_paise,status,version,expires_at,created_at,proposal_milestones(id,sort_order,title,price_paise)").order("created_at",{ascending:false});
  const ids=[...new Set((data||[]).map((item)=>item.client_id))];const {data:clients}=ids.length?await context.db.from("profiles").select("id,full_name").in("id",ids):{data:[]};const names=new Map((clients||[]).map((item)=>[item.id,item.full_name]));
  return <><div className="portal-page-heading"><div><h1>Proposals</h1><p>Review sent proposals and prepare revisions.</p></div><Link className="portal-button portal-button--secondary" href="/admin/requests">Project requests</Link></div>{error&&<p className="portal-inline-error">Unable to load proposals.</p>}<section className="portal-panel"><div className="portal-panel-heading"><h2>All proposals</h2><span>{data?.length||0} total</span></div>{data?.length?<div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Proposal</th><th>Client</th><th>Version</th><th>Milestones</th><th>Price</th><th>Status</th><th></th></tr></thead><tbody>{data.map((item)=><tr key={item.id}><td>{item.title}<div className="portal-row-detail">{item.id}</div></td><td>{names.get(item.client_id)||"Client"}</td><td>{item.version}</td><td>{item.proposal_milestones.length}</td><td>{new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR"}).format(item.total_price_paise/100)}</td><td><span className={`portal-status portal-status--${item.status}`}>{item.status}</span></td><td>{["draft","sent"].includes(item.status)&&<Link href={`/admin/proposals/${item.id}`}>Revise</Link>}</td></tr>)}</tbody></table></div>:<div className="portal-empty">No proposals have been created.</div>}</section></>;
}
