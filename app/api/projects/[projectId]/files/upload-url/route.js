import { randomUUID } from "node:crypto";
import { getSignedInContext } from "../../../../../../lib/auth/guards.js";
import { jsonError, readJson } from "../../../../../../lib/http/responses.js";
import { getImageKitClient, isImageKitConfigured } from "../../../../../../lib/imagekit/client.js";
import { z } from "zod";

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

const uploadSchema = z.object({
  filename: z.string().trim().min(1).max(255),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive().max(MAX_BYTES),
  category: z.enum(["brief", "reference", "deliverable", "invoice", "receipt", "other"]).optional(),
});

export async function POST(request, { params }) {
  const context = await getSignedInContext();
  if (!context) return jsonError("Sign in to continue.", 401, "unauthenticated");

  const { projectId } = await params;
  const { data: project } = await context.db.from("projects").select("id,client_id").eq("id", projectId).maybeSingle();
  if (!project) return jsonError("Project not found.", 404, "not_found");

  let allowed = context.profile.role === "ADMIN" || (context.profile.role === "CLIENT" && project.client_id === context.user.id);
  if (context.profile.role === "TEAM_MEMBER") {
    const { data: member } = await context.db.from("project_members").select("project_id").eq("project_id", projectId).eq("profile_id", context.user.id).eq("membership_role", "TEAM_MEMBER").maybeSingle();
    allowed = Boolean(member);
  }
  if (!allowed) return jsonError("Project not found.", 404, "not_found");

  const parsed = uploadSchema.safeParse(await readJson(request));
  if (!parsed.success || !ALLOWED_TYPES.has(parsed.data?.mimeType)) {
    return jsonError("Choose a supported file up to 50 MB in size.", 422, "invalid_file");
  }

  if (!isImageKitConfigured()) {
    return jsonError("ImageKit is not configured. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT.", 503, "storage_unconfigured");
  }

  const category = context.profile.role === "CLIENT" ? "reference" : parsed.data.category || "deliverable";
  const clientVisible = context.profile.role === "CLIENT" || category === "deliverable";
  const safeName = parsed.data.filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120) || "upload";
  const folder = `/agency-projects/${projectId}`;
  const storagePath = `${folder}/${randomUUID()}_${safeName}`;

  // Clean expired upload intents for this user
  await context.db.from("file_upload_intents").delete().eq("user_id", context.user.id).lt("expires_at", new Date().toISOString());

  // Generate ImageKit direct-upload auth parameters
  const ik = getImageKitClient();
  const auth = ik.getAuthenticationParameters();

  const { error: intentError } = await context.db.from("file_upload_intents").insert({
    user_id: context.user.id,
    project_id: projectId,
    storage_path: storagePath,
    filename: parsed.data.filename,
    mime_type: parsed.data.mimeType,
    size_bytes: parsed.data.sizeBytes,
    category,
    client_visible: clientVisible,
    expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  });

  if (intentError) return jsonError("Unable to prepare this upload.", 500, "database_error");

  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || process.env.IMAGEKIT_PUBLIC_KEY;
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || process.env.IMAGEKIT_URL_ENDPOINT;

  return Response.json({
    path: storagePath,
    folder,
    fileName: safeName,
    publicKey,
    urlEndpoint,
    auth,
  }, {
    status: 201,
    headers: { "Cache-Control": "private, no-store" },
  });
}
