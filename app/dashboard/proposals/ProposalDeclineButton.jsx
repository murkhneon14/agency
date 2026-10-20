"use client";

import { useState } from "react";

export default function ProposalDeclineButton({proposalId}){
  const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");
  async function decline(){if(!window.confirm("Decline this proposal?"))return;setBusy(true);setMessage("");try{const response=await fetch(`/api/proposals/${proposalId}/decline`,{method:"POST"});const result=await response.json();if(!response.ok)throw new Error(result?.error?.message||"Unable to decline proposal.");window.location.reload();}catch(error){setMessage(error.message||"Unable to decline proposal.");setBusy(false);}}
  return <div><button className="portal-button portal-button--secondary" disabled={busy} onClick={decline}>{busy?"Saving…":"Decline proposal"}</button>{message&&<small className="portal-inline-error">{message}</small>}</div>;
}
