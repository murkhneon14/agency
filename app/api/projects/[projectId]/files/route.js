import { getSignedInContext } from "../../../../../lib/auth/guards.js";
import { jsonError } from "../../../../../lib/http/responses.js";
import { getImageKitClient, isImageKitConfigured } from "../../../../../lib/imagekit/client.js";

export const dynamic = "force-dynamic";
const MAX_BYTES = 50 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "text/plain",
  "application/zip",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

async function projectAccess(context, projectId) {
  const { data: project } = await context.db.from("projects").select("id,client_id").eq("id", projectId).maybeSingle();
  if (!project) return null;
  if (context.profile.role === "ADMIN" || (context.profile.role === "CLIENT" && project.client_id === context.user.id)) return project;
  if (context.profile.role === "TEAM_MEMBER") {
    const { data: member } = await context.db.from("project_members").select("project_id").eq("project_id", projectId).eq("profile_id", context.user.id).eq("membership_role", "TEAM_MEMBER").maybeSingle();
    if (member) return project;
  }
  return null;
}

export async function GET(_request, { params }) {
  const context = await getSignedInContext();
  if (!context) return jsonError("Sign in to continue.", 401, "unauthenticated");

  const { projectId } = await params;
  if (!(await projectAccess(context, projectId))) return jsonError("Project not found.", 404, "not_found");

  let query = context.db
    .from("project_files")
    .select("id,project_id,filename,mime_type,size_bytes,category,client_visible,created_at,milestone_id")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (context.profile.role === "CLIENT") query = query.eq("client_visible", true);

  const { data, error } = await query;
  if (error) return jsonError("Unable to load project files.", 500, "database_error");

  return Response.json({ files: data }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request, { params }) {
  const context = await getSignedInContext();
  if (!context) return jsonError("Sign in to continue.", 401, "unauthenticated");

  const { projectId } = await params;
  const project = await projectAccess(context, projectId);
  if (!project) return jsonError("Project not found.", 404, "not_found");

  if (!isImageKitConfigured()) {
    return jsonError("ImageKit is not configured. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT.", 503, "storage_unconfigured");
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size < 1 || file.size > MAX_BYTES || !ALLOWED_TYPES.has(file.type)) {
    return jsonError("Choose a supported file up to 50 MB in size.", 422, "invalid_file");
  }

  const category = context.profile.role === "CLIENT" ? "reference" : String(formData.get("category") || "deliverable");
  if (!["brief", "reference", "deliverable", "invoice", "receipt", "other"].includes(category)) {
    return jsonError("Choose a supported file category.", 422, "invalid_category");
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120) || "upload";
  const ik = getImageKitClient();
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  let ikResult;
  try {
    ikResult = await ik.upload({
      file: fileBuffer,
      fileName: safeName,
      folder: `/agency-projects/${projectId}`,
      isPrivateFile: true,
      useUniqueFileName: true,
    });
  } catch (uploadError) {
    return jsonError(uploadError instanceof Error ? uploadError.message : "Unable to store this file in ImageKit.", 503, "storage_error");
  }

  const clientVisible = context.profile.role === "CLIENT" || category === "deliverable";
  const storagePath = ikResult.filePath || `/agency-projects/${projectId}/${safeName}`;

  const { data, error } = await context.db
    .from("project_files")
    .insert({
      project_id: projectId,
      uploaded_by: context.user.id,
      storage_path: storagePath,
      filename: file.name.slice(0, 255),
      mime_type: file.type,
      size_bytes: file.size,
      category,
      client_visible: clientVisible,
    })
    .select("id,filename,category,size_bytes,client_visible,created_at")
    .single();

  if (error) {
    try {
      if (ikResult.fileId) await ik.deleteFile(ikResult.fileId);
    } catch {
      // Ignored
    }
    return jsonError("Unable to register the uploaded file.", 500, "database_error");
  }

  await context.db.from("audit_logs").insert({
    actor_id: context.user.id,
    action: "project_file.uploaded",
    entity_type: "project_file",
    entity_id: data.id,
    metadata: { project_id: projectId, category },
  });

  return Response.json({ file: data }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
}
