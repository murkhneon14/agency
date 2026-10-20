import Link from "next/link";
import Sidebar from "../components/Sidebar.jsx";
import LogoutButton from "./LogoutButton.jsx";

export default function PortalShell({ user, profile, area = "client", children }) {
  const links = area === "admin"
    ? [["Overview", "/admin"], ["Requests", "/admin/requests"], ["Proposals", "/admin/proposals"], ["Clients", "/admin/clients"], ["Projects", "/admin/projects"], ["Files", "/admin/files"], ["Payments", "/admin/payments"], ["Invoices", "/admin/invoices"], ["Portfolio", "/admin/portfolio"], ["Messages", "/admin/messages"], ["Notifications", "/admin/notifications"]]
    : area === "team"
      ? [["Overview", "/team"]]
      : [["Overview", "/dashboard"], ["My projects", "/dashboard/projects"], ["Project requests", "/dashboard/requests"], ["Proposals", "/dashboard/proposals"], ["Payments", "/dashboard/payments"], ["Invoices", "/dashboard/invoices"], ["Files", "/dashboard/files"], ["Notifications", "/dashboard/notifications"], ["Profile", "/dashboard/profile"]];

  return (
    <div className="projects-page portal-app portal-site-frame portal-shell">
      <Sidebar activeSection="playground" />
      <div className="portal-content">
        <header className="portal-topbar">
          <div className="portal-topbar-title">
            <span>{area === "admin" ? "Agency workspace" : area === "team" ? "Team workspace" : "My Project"}</span>
            <small>{profile.full_name || user.email}</small>
          </div>
          <span className="portal-role-chip">{profile.role.replace("_", " ")}</span>
          <LogoutButton />
        </header>
        <nav className="portal-navigation" aria-label="Workspace navigation">
          {links.map(([label, href]) => <Link className="portal-nav-link" href={href} key={href}>{label}</Link>)}
        </nav>
        <main className="portal-main">{children}</main>
      </div>
    </div>
  );
}
