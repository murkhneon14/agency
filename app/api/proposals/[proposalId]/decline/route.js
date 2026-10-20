import { requireRole } from "../../../../../lib/auth/guards.js";
import { jsonError, roleErrorResponse } from "../../../../../lib/http/responses.js";

export const dynamic = "force-dynamic";

export async function POST(_request,{params}){
  const context=await requireRole(["CLIENT"]);const denied=roleErrorResponse(context);if(denied)return denied;
  const {proposalId}=await params;
  const {data:proposal,error}=await context.db.from("proposals").update({status:"rejected"}).eq("id",proposalId).eq("client_id",context.user.id).eq("status","sent").select("id,created_by").maybeSingle();
  if(error)return jsonError("Unable to decline this proposal.",500,"database_error");if(!proposal)return jsonError("Proposal is no longer available.",409,"proposal_unavailable");
  await context.db.from("audit_logs").insert({actor_id:context.user.id,action:"proposal.rejected",entity_type:"proposal",entity_id:proposalId});
  await context.db.from("notifications").insert({profile_id:proposal.created_by,event_type:"proposal.rejected",title:"Proposal declined",body:"The client declined a proposal.",href:"/admin/requests"});
  return Response.json({declined:true},{headers:{"Cache-Control":"private, no-store"}});
}
