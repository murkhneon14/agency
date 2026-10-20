import { redirect } from "next/navigation";
import PortalShell from "../_portal/PortalShell.jsx";
import { requireRole } from "../../lib/auth/guards.js";
import "../../portal.css";

export const dynamic = "force-dynamic";

export default async function ClientDashboardLayout({ children }) {
  const context = await requireRole(["CLIENT"]);
  if (context.error) redirect(context.status === 401 ? "/login" : context.error === "forbidden" ? "/auth/redirect" : "/login");
  return <PortalShell user={context.user} profile={context.profile}>{children}</PortalShell>;
}
