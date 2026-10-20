import MarketingHome from "./_marketing/MarketingHome.jsx";
import { getSignedInContext } from "../lib/auth/guards.js";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const context = await getSignedInContext();
  const account = context
    ? {
        role: context.profile.role,
        fullName: context.profile.full_name,
        email: context.user.email,
      }
    : null;

  return <MarketingHome account={account} />;
}
