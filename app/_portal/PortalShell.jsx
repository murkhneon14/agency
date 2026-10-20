import Link from "next/link";
import LogoutButton from "./LogoutButton.jsx";

export default function PortalShell({ user, profile, area = "client", children }) {
  const links = area === "admin"
    ? [["Overview", "/admin"], ["Requests", "/admin/requests"], ["Proposals", "/admin/proposals"], ["Clients", "/admin/clients"], ["Projects", "/admin/projects"], ["Files", "/admin/files"], ["Payments", "/admin/payments"], ["Invoices", "/admin/invoices"], ["Portfolio", "/admin/portfolio"], ["Messages", "/admin/messages"], ["Notifications", "/admin/notifications"]]
    : area === "team"
      ? [["Overview", "/team"]]
      : [["Overview", "/dashboard"], ["My projects", "/dashboard/projects"], ["Project requests", "/dashboard/requests"], ["Proposals", "/dashboard/proposals"], ["Payments", "/dashboard/payments"], ["Invoices", "/dashboard/invoices"], ["Files", "/dashboard/files"], ["Notifications", "/dashboard/notifications"], ["Profile", "/dashboard/profile"]];

  return (
    <div className="portal-shell">
      <aside className="portal-sidebar">
        <Link className="portal-brand" href="/"><span className="portal-brand-mark">8</span><span>8bitbrains</span></Link>
        <div className="portal-sidebar-caption">{area === "admin" ? "WORKSPACE" : "CLIENT PORTAL"}</div>
        <nav className="portal-navigation" aria-label="Portal navigation">
          {links.map(([label, href]) => <Link className="portal-nav-link" href={href} key={href}>{label}</Link>)}
        </nav>
        <div className="portal-sidebar-bottom">
          <div className="portal-user-avatar">{(profile.full_name || user.email || "C").slice(0, 1).toUpperCase()}</div>
          <div className="portal-user-copy"><strong>{profile.full_name || "Account"}</strong><small>{user.email}</small></div>
          <LogoutButton />
        </div>
      </aside>
      <div className="portal-content">
        <header className="portal-topbar"><span>{area === "admin" ? "Agency workspace" : area === "team" ? "Team workspace" : "Client workspace"}</span><span className="portal-role-chip">{profile.role.replace("_", " ")}</span></header>
        <main className="portal-main">{children}</main>
      </div>
    </div>
  );
}
