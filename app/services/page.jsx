import Link from "next/link";
import "../../portal.css";

const services=[
  ["Website Development","Responsive websites and web applications built around your business needs."],
  ["E-commerce Development","Product catalogs, storefronts, and operational tools for online commerce."],
  ["Mobile Application Development","Mobile product experiences designed for your users and workflows."],
  ["SaaS Development","Subscription software, internal tools, and multi-user product platforms."],
  ["UI/UX Design","Research, interface design, and prototypes that clarify the product before development."],
  ["AI Integration","Practical AI features integrated into existing products and workflows."],
  ["Website Maintenance","Ongoing fixes, upgrades, content support, and performance improvements."],
];
export default function ServicesPage(){return <main className="portal-app public-document"><div className="public-document-inner"><header className="public-page-nav"><Link className="portal-brand" href="/"><span className="portal-brand-mark">8</span><span>8bitbrains</span></Link><nav><Link href="/portfolio">Portfolio</Link><Link href="/about">About</Link><Link href="/contact">Contact</Link></nav></header><div className="portal-page-heading"><div><h1>Services</h1><p>Product design and software development for teams building useful digital services.</p></div><Link className="portal-button portal-button--primary" href="/contact">Discuss a project</Link></div><div className="public-service-grid">{services.map(([title,description])=><article className="portal-panel public-service-card" key={title}><span className="portal-brand-mark">↗</span><h2>{title}</h2><p>{description}</p><Link href="/contact">Start a conversation →</Link></article>)}</div><footer className="public-page-footer"><Link href="/privacy-policy">Privacy</Link><Link href="/terms-of-service">Terms</Link><Link href="/login">Client portal</Link></footer></div></main>}
