import Link from "next/link";
import ContactForm from "./ContactForm.jsx";
import "../../portal.css";

export default function ContactPage(){return <main className="portal-app public-document"><div className="public-document-inner"><PublicNav /><div className="portal-page-heading"><div><h1>Contact</h1><p>Tell us what you are planning. We’ll follow up about scope and next steps.</p></div></div><div className="public-contact-grid"><ContactForm /><aside className="portal-panel portal-panel-body"><h2>Prefer the project portal?</h2><p>Create an account to submit a structured project request and track the proposal.</p><Link className="portal-button portal-button--secondary" href="/signup">Create an account</Link><p className="portal-field-hint">No public office address or phone contact is configured yet.</p></aside></div><PublicFooter /></div></main>;}
function PublicNav(){return <header className="public-page-nav"><Link className="portal-brand" href="/"><span className="portal-brand-mark">8</span><span>8bitbrains</span></Link><nav><Link href="/services">Services</Link><Link href="/portfolio">Portfolio</Link><Link href="/about">About</Link></nav></header>}
function PublicFooter(){return <footer className="public-page-footer"><Link href="/privacy-policy">Privacy</Link><Link href="/terms-of-service">Terms</Link></footer>}
