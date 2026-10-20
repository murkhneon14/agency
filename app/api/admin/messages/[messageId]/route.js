import { requireRole } from "../../../../../lib/auth/guards.js";
import { jsonError,readJson,roleErrorResponse } from "../../../../../lib/http/responses.js";
import { z } from "zod";

export const dynamic="force-dynamic";
const statusSchema=z.object({status:z.enum(["new","read","replied","archived"])});
export async function PATCH(request,{params}){const context=await requireRole(["ADMIN"]);const denied=roleErrorResponse(context);if(denied)return denied;const {messageId}=await params;const parsed=statusSchema.safeParse(await readJson(request));if(!parsed.success)return jsonError("Choose a valid message status.",422,"validation_error");const {data,error}=await context.db.from("contact_messages").update({status:parsed.data.status}).eq("id",messageId).select("id,status").maybeSingle();if(error)return jsonError("Unable to update message.",500,"database_error");if(!data)return jsonError("Message not found.",404,"not_found");await context.db.from("audit_logs").insert({actor_id:context.user.id,action:"contact_message.status_changed",entity_type:"contact_message",entity_id:data.id,metadata:{status:data.status}});return Response.json({message:data},{headers:{"Cache-Control":"private, no-store"}});}
