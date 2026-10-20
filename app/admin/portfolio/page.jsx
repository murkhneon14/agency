import { redirect } from "next/navigation";
import { requireRole } from "../../../lib/auth/guards.js";
import PortfolioForm from "./PortfolioForm.jsx";
import PortfolioActions from "./PortfolioActions.jsx";

export const dynamic="force-dynamic";

export default async function AdminPortfolioPage(){
  const context=await requireRole(["ADMIN"]);if(context.error)redirect(context.status===401?"/login":"/auth/redirect");
  const {data,error}=await context.db.from("portfolio_projects").select("id,title,slug,category,technologies,is_demo,is_published,sort_order,created_at").order("sort_order").order("created_at",{ascending:false});
  return <><div className="portal-page-heading"><div><h1>Portfolio</h1><p>Manage public portfolio entries. Demonstration work is clearly labeled.</p></div></div><section className="portal-panel"><div className="portal-panel-heading"><h2>Add a portfolio entry</h2></div><PortfolioForm /></section><section className="portal-panel"><div className="portal-panel-heading"><h2>Portfolio entries</h2><span>{data?.length||0} total</span></div>{error&&<p className="portal-inline-error">Unable to load portfolio entries.</p>}{data?.length?<div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Title</th><th>Category</th><th>Technologies</th><th>Demo</th><th>Status</th><th></th></tr></thead><tbody>{data.map((item)=><tr key={item.id}><td>{item.title}<div className="portal-row-detail">/{item.slug}</div></td><td>{item.category}</td><td>{item.technologies.join(", ")}</td><td>{item.is_demo?"Demonstration":"Client work"}</td><td>{item.is_published?"Published":"Draft"}</td><td><PortfolioActions projectId={item.id} published={item.is_published} /></td></tr>)}</tbody></table></div>:<div className="portal-empty">No portfolio entries yet.</div>}</section></>;
}
