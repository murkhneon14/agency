import { redirect } from "next/navigation";
import { requireRole } from "../../../lib/auth/guards.js";
import ProfileForm from "./ProfileForm.jsx";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const context = await requireRole(["CLIENT"]);
  if (context.error) redirect(context.status === 401 ? "/login" : "/auth/redirect");
  return <><div className="portal-page-heading"><div><h1>Profile</h1><p>Update your contact information. Account roles are managed by the agency.</p></div></div><section className="portal-panel"><div className="portal-panel-heading"><h2>Account details</h2></div><ProfileForm profile={{ ...context.profile, email: context.user.email }} /></section></>;
}
