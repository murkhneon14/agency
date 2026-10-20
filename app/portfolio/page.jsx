import Link from "next/link";
import { createAdminClient } from "../../lib/supabase/admin.js";
import "../../portal.css";

export const dynamic="force-dynamic";

export default async function PortfolioPage(){
  let projects=[];
  try{const db=createAdminClient();const {data}=await db.from("portfolio_projects").select("id,title,description,category,technologies,demo_url,is_demo").eq("is_published",true).order("sort_order");projects=data||[];}catch{}
  return <main className="portal-app public-document"><div className="public-document-inner"><header className="public-page-nav"><Link className="portal-brand" href="/"><span className="portal-brand-mark">8</span><span>8bitbrains</span></Link><nav><Link href="/services">Services</Link><Link href="/about">About</Link><Link href="/contact">Contact</Link></nav></header><div className="portal-page-heading"><div><h1>Selected work</h1><p>Examples of the kinds of digital products we can build.</p></div></div>{projects.length?<div className="public-portfolio-grid">{projects.map((project)=><article className="portal-panel public-portfolio-card" key={project.id}><div className="public-portfolio-cover"><span>{project.category}</span></div><div className="portal-panel-body"><div className="portal-actions"><h2>{project.title}</h2>{project.is_demo&&<span className="portal-status">Demonstration</span>}</div><p>{project.description}</p><p className="portal-row-detail">{project.technologies.join(" · ")}</p>{project.demo_url&&<a href={project.demo_url} target="_blank" rel="noreferrer">View demo ↗</a>}</div></article>)}</div>:<section className="portal-panel"><div className="portal-empty"><strong>Portfolio examples are being prepared</strong>Check back later or <Link href="/contact">tell us about your project</Link>.</div></section>}<footer className="public-page-footer">8bitbrains · Work examples are labeled as demonstrations when they are not client projects.</footer></div></main>;
}
