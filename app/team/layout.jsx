import { redirect } from "next/navigation";
import PortalShell from "../_portal/PortalShell.jsx";
import { requireRole } from "../../lib/auth/guards.js";
import "../../portal.css";

export const dynamic = "force-dynamic";

export default async function TeamLayout({ children }) {
  const context = await requireRole(["TEAM_MEMBER"]);
  if (context.error) redirect(context.status === 401 ? "/login" : "/auth/redirect");
  return <PortalShell user={context.user} profile={context.profile} area="team">{children}</PortalShell>;
}
