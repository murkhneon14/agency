import { createAdminClient } from "../../../lib/supabase/admin.js";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = createAdminClient();
    const { data, error } = await db.from("portfolio_projects").select("id,title,slug,description,category,technologies,thumbnail_path,demo_url,is_demo,sort_order").eq("is_published", true).order("sort_order").order("created_at", { ascending: false });
    if (error) return Response.json({ projects: [] }, { status: 503, headers: { "Cache-Control": "no-store" } });
    return Response.json({ projects: data }, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
  } catch {
    return Response.json({ projects: [] }, { headers: { "Cache-Control": "no-store" } });
  }
}
