import { requireRole } from "../../../../lib/auth/guards.js";
import { jsonError,roleErrorResponse } from "../../../../lib/http/responses.js";

export const dynamic="force-dynamic";
export async function GET(){const context=await requireRole(["ADMIN"]);const denied=roleErrorResponse(context);if(denied)return denied;const {data,error}=await context.db.from("contact_messages").select("id,name,email,subject,message,status,created_at").order("created_at",{ascending:false}).limit(500);if(error)return jsonError("Unable to load contact messages.",500,"database_error");return Response.json({messages:data},{headers:{"Cache-Control":"private, no-store"}});}
