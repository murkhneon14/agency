import { getSignedInContext } from "../../../../../../lib/auth/guards.js";
import { jsonError } from "../../../../../../lib/http/responses.js";
import { getSignedFileUrl, isImageKitConfigured } from "../../../../../../lib/imagekit/client.js";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const context = await getSignedInContext();
  if (!context) return jsonError("Sign in to continue.", 401, "unauthenticated");

  const { projectId, fileId } = await params;
  const { data: project } = await context.db.from("projects").select("id,client_id").eq("id", projectId).maybeSingle();
  if (!project) return jsonError("File not found.", 404, "not_found");

  let allowed = context.profile.role === "ADMIN" || (context.profile.role === "CLIENT" && project.client_id === context.user.id);
  if (context.profile.role === "TEAM_MEMBER") {
    const { data: member } = await context.db.from("project_members").select("project_id").eq("project_id", projectId).eq("profile_id", context.user.id).eq("membership_role", "TEAM_MEMBER").maybeSingle();
    allowed = Boolean(member);
  }
  if (!allowed) return jsonError("File not found.", 404, "not_found");

  let fileQuery = context.db.from("project_files").select("id,project_id,storage_path,filename,client_visible").eq("id", fileId).eq("project_id", projectId);
  if (context.profile.role === "CLIENT") fileQuery = fileQuery.eq("client_visible", true);

  const { data: file, error } = await fileQuery.maybeSingle();
  if (error || !file) return jsonError("File not found.", 404, "not_found");

  if (!isImageKitConfigured()) {
    return jsonError("ImageKit is not configured. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT.", 503, "storage_unconfigured");
  }

  try {
    const signedUrl = getSignedFileUrl(file.storage_path, 300);
    return new Response(null, {
      status: 302,
      headers: {
        Location: signedUrl,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Unable to generate download link.", 500, "storage_error");
  }
}
