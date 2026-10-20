"use client";

import { useState } from "react";

export default function PortfolioActions({ projectId, published }) {
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  async function toggle(){setBusy(true);setMessage("");try{const response=await fetch(`/api/admin/portfolio/${projectId}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({isPublished:!published})});const result=await response.json();if(!response.ok)throw new Error(result?.error?.message||"Unable to change publish state.");window.location.reload();}catch(error){setMessage(error.message||"Unable to update entry.");setBusy(false);}}
  return <div><button className="portal-button portal-button--secondary" disabled={busy} onClick={toggle}>{busy?"Saving…":published?"Unpublish":"Publish"}</button>{message&&<small className="portal-inline-error">{message}</small>}</div>;
}
