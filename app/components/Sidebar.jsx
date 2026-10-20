"use client";

import Link from "next/link";
import AccountMenu from "../_marketing/components/AccountMenu.jsx";

export default function Sidebar({ activeSection, categorySlug = "mobile-apps", account = null }) {
  const closeMenu = (event) => {
    event.currentTarget
      .closest(".projects-sidebar")
      ?.querySelector(".projects-menu-disclosure")
      ?.removeAttribute("open");
  };
  const activeClass = (section) => `projects-nav-link${activeSection === section ? " is-active" : ""}`;

  return (
    <aside className="projects-sidebar">
      <div className="projects-sidebar__top">
        <div className="projects-brand-row">
          <Link className="projects-brand" href="/" aria-label="8bitbrains home">
            <img src="/logo1.png" alt="" />
            <span>8bitbrains</span>
          </Link>
          <details className="projects-menu-disclosure">
            <summary className="projects-menu" aria-label="Toggle navigation menu">
              <span /><span /><span />
            </summary>
          </details>
          <div className="projects-mobile-account">
            <AccountMenu account={account} includeSiteNavigation />
          </div>
        </div>

        <div className="projects-sidebar__menu" id="projects-sidebar-menu">
        <div className="projects-sidebar__divider" />

        <nav className="projects-main-nav" aria-label="Main navigation">
          <Link className={activeClass("home")} href="/" onClick={closeMenu} aria-current={activeSection === "home" ? "page" : undefined}>
            <span className="projects-nav-link__left">
              <svg className="projects-nav-icon" viewBox="0 0 20 20" fill="#304F67" aria-hidden="true"><path d="M11.3 2.84a1.5 1.5 0 00-2.6 0L3.5 6.41A1.5 1.5 0 002.5 8.3v6.91c0 1.27 1.03 2.29 2.29 2.29h2.5a.63.63 0 00.63-.63v-2.91a2.08 2.08 0 014.16 0v2.91c0 .35.28.63.63.63h2.5a2.29 2.29 0 002.29-2.29V8.3a1.5 1.5 0 00-1-1.89L11.3 2.84z" /></svg>
              <span>Home</span>
            </span>
            {activeSection === "home" && <span className="projects-nav-arrow">→</span>}
          </Link>
          <Link className={activeClass("projects")} href={`/projects/${categorySlug}`} onClick={closeMenu} aria-current={activeSection === "projects" ? "page" : undefined}>
            <span className="projects-nav-link__left">
              <svg className="projects-nav-icon" viewBox="0 0 20 20" fill="none" stroke="#456176" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="3" width="6" height="8" rx="1.5" /><rect x="11" y="9" width="6" height="8" rx="1.5" /><rect x="11" y="3" width="6" height="4" rx="1" /><rect x="3" y="13" width="6" height="4" rx="1" /></svg>
              <span>Projects</span>
            </span>
            {activeSection === "projects" && <span className="projects-nav-arrow">→</span>}
          </Link>
          <Link className={activeClass("playground")} href="/signup" onClick={closeMenu} aria-current={activeSection === "playground" ? "page" : undefined}>
            <span className="projects-nav-link__left">
              <svg className="projects-nav-icon" viewBox="0 0 20 20" fill="none" stroke="#456176" strokeWidth="1.5" aria-hidden="true"><path d="M9.17 10.83h1.48c.66 0 1.3-.26 1.77-.73l3.84-3.85a1.77 1.77 0 00-2.5-2.5L9.9 7.6a2.08 2.08 0 00-.73 1.77v1.46z" /><path d="M10 17.5c-.42 0-2.55-.73-4.4-2.58-3.09-3.09-3.88-7.31-1.77-9.43 1.74-1.74 4.9-1.51 7.69.32" /><path d="M14.26 8.33c2.4 2.78 3.42 5.61 1.58 7.08-1.38 1.11-3.13-.17-4.15-1.16" /></svg>
              <span>My Project</span>
            </span>
            {activeSection === "playground" && <span className="projects-nav-arrow">→</span>}
          </Link>
          <a className={activeClass("pricing")} href="/#pricing" onClick={closeMenu} aria-current={activeSection === "pricing" ? "page" : undefined}>
            <span className="projects-nav-link__left">
              <svg className="projects-nav-icon" viewBox="0 0 20 20" fill="none" stroke="#456176" strokeWidth="1.5" aria-hidden="true"><circle cx="10" cy="10" r="7.5" /><path d="M10 6.15v-.86M10 13.85v.86M11.85 7.43a2.1 2.1 0 00-1.85-.86h-.24c-1.05 0-1.9.68-1.9 1.52v.07c0 .6.43 1.15 1.1 1.42l2.08.84c.67.27 1.1.82 1.1 1.42 0 .88-.89 1.59-1.99 1.59H10a2.1 2.1 0 01-1.85-.86" /></svg>
              <span>Pricing</span>
            </span>
            {activeSection === "pricing" && <span className="projects-nav-arrow">→</span>}
          </a>
          <span className="projects-nav-link projects-nav-link--muted">
            <span className="projects-nav-link__left">
              <svg className="projects-nav-icon" viewBox="0 0 20 20" fill="none" stroke="#456176" strokeWidth="1.5" aria-hidden="true"><rect x="2.29" y="6.46" width="15.42" height="10.42" rx="1.67" /><path d="M2.29 10.63h15.42M10 10.63v2.08M6.67 6.46V4.79a1.67 1.67 0 011.67-1.67h3.33a1.67 1.67 0 011.67 1.67v1.67" /></svg>
              <span>Career</span>
            </span>
            <span className="projects-coming-soon">Coming soon</span>
          </span>
        </nav>

        <div className="projects-sidebar__label">Start Project</div>
        <nav className="projects-quick-links" aria-label="Contact">
          <a href="tel:8789053612">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>
            <span>Start Project</span>
          </a>
          <a href="https://wa.me/918789053612" target="_blank" rel="noreferrer">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            <span>Send a Message</span>
          </a>
        </nav>
        </div>
      </div>

      <div className="projects-brands">
        <p>Worked with <strong>10+ Brands</strong></p>
        <div className="projects-brand-tags"><span>✦ StartupX</span><span>✦ PixelForge</span><span>✦ CodeNest</span><span>✦ AppVault</span><span>✦ DigiCraft</span><span>✦ ByteWorks</span></div>
      </div>
    </aside>
  );
}
