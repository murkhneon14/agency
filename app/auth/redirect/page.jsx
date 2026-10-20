import { redirect } from "next/navigation";
import { getSignedInContext } from "../../../lib/auth/guards.js";

export const dynamic = "force-dynamic";

export default async function AuthRedirectPage() {
  const context = await getSignedInContext();
  if (!context) redirect("/login");
  if (context.profile.role === "ADMIN") redirect("/admin");
  if (context.profile.role === "TEAM_MEMBER") redirect("/team");
  redirect("/dashboard");
}
