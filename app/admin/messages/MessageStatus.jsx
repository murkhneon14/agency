"use client";

import { useState } from "react";

export default function MessageStatus({messageId,status}){const [current,setCurrent]=useState(status);const [busy,setBusy]=useState(false);const [error,setError]=useState("");async function update(event){const next=event.target.value;setBusy(true);setError("");try{const response=await fetch(`/api/admin/messages/${messageId}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:next})});const result=await response.json();if(!response.ok)throw new Error(result?.error?.message||"Update failed.");setCurrent(next);}catch(err){setError(err.message||"Update failed.");}finally{setBusy(false);}}return <div><select aria-label="Message status" value={current} disabled={busy} onChange={update}>{["new","read","replied","archived"].map((value)=><option key={value}>{value}</option>)}</select>{error&&<small className="portal-inline-error">{error}</small>}</div>;}
