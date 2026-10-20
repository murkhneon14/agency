import { redirect } from "next/navigation";
import { requireRole } from "../../../lib/auth/guards.js";
import NotificationList from "../../_portal/NotificationList.jsx";

export const dynamic = "force-dynamic";

export default async function AdminNotifications() {
  const context = await requireRole(["ADMIN"]);
  if (context.error) redirect(context.status === 401 ? "/login" : "/auth/redirect");
  const { data } = await context.db.from("notifications").select("id,event_type,title,body,href,read_at,created_at").eq("profile_id", context.user.id).order("created_at", { ascending: false }).limit(100);
  return <><div className="portal-page-heading"><div><h1>Notifications</h1><p>Request, project, and payment activity for your account.</p></div></div><NotificationList items={data||[]} /></>;
}
