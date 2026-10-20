import { getSignedInContext } from "../../../../../../lib/auth/guards.js";
import { jsonError, readJson } from "../../../../../../lib/http/responses.js";
import { getImageKitClient, isImageKitConfigured } from "../../../../../../lib/imagekit/client.js";
import { z } from "zod";

export const dynamic = "force-dynamic";

const confirmSchema = z.object({
  path: z.string().min(1).max(500),
  fileId: z.string().optional(),
  actualPath: z.string().optional(),
});

export async function POST(request, { params }) {
  const context = await getSignedInContext();
  if (!context) return jsonError("Sign in to continue.", 401, "unauthenticated");

  const { projectId } = await params;
  const parsed = confirmSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError("Upload intent not found.", 404, "not_found");

  const { data: project } = await context.db.from("projects").select("id,client_id").eq("id", projectId).maybeSingle();
  if (!project) return jsonError("Upload intent not found.", 404, "not_found");

  let accessGranted = context.profile.role === "ADMIN" || (context.profile.role === "CLIENT" && project.client_id === context.user.id);
  if (context.profile.role === "TEAM_MEMBER") {
    const { data: member } = await context.db.from("project_members").select("project_id").eq("project_id", projectId).eq("profile_id", context.user.id).eq("membership_role", "TEAM_MEMBER").maybeSingle();
    accessGranted = Boolean(member);
  }
  if (!accessGranted) return jsonError("Upload intent not found.", 404, "not_found");

  // Find the upload intent by user, project, and storage path
  const { data: intent } = await context.db
    .from("file_upload_intents")
    .select("*")
    .eq("storage_path", parsed.data.path)
    .eq("project_id", projectId)
    .eq("user_id", context.user.id)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (!intent) return jsonError("Upload expired. Select the file again to retry.", 410, "upload_expired");

  const finalPath = parsed.data.actualPath || intent.storage_path;

  // If ImageKit fileId was passed, verify details with ImageKit
  if (parsed.data.fileId && isImageKitConfigured()) {
    try {
      const ik = getImageKitClient();
      const details = await ik.getFileDetails(parsed.data.fileId);
      if (!details || details.size <= 0) {
        await ik.deleteFile(parsed.data.fileId);
        await context.db.from("file_upload_intents").delete().eq("id", intent.id);
        return jsonError("Uploaded file was invalid or empty.", 422, "invalid_upload");
      }
    } catch {
      // Allow proceeding if ImageKit details check has transient issue
    }
  }

  const { data: file, error } = await context.db
    .from("project_files")
    .insert({
      project_id: projectId,
      uploaded_by: context.user.id,
      storage_path: finalPath,
      filename: intent.filename,
      mime_type: intent.mime_type,
      size_bytes: intent.size_bytes,
      category: intent.category,
      client_visible: intent.client_visible,
    })
    .select("id,filename,category,size_bytes,client_visible,created_at")
    .single();

  if (error) {
    if (parsed.data.fileId && isImageKitConfigured()) {
      try {
        const ik = getImageKitClient();
        await ik.deleteFile(parsed.data.fileId);
      } catch {
        // Ignored
      }
    }
    await context.db.from("file_upload_intents").delete().eq("id", intent.id);
    return jsonError("Unable to register the uploaded file.", 500, "database_error");
  }

  await context.db.from("file_upload_intents").delete().eq("id", intent.id);
  await context.db.from("audit_logs").insert({
    actor_id: context.user.id,
    action: "project_file.uploaded",
    entity_type: "project_file",
    entity_id: file.id,
    metadata: { project_id: projectId, category: intent.category },
  });

  return Response.json({ file }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
}
