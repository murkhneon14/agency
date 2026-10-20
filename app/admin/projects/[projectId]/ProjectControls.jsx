"use client";

import { useState } from "react";

export function MilestoneProgressEditor({ projectId, milestone }) {
  const [status, setStatus] = useState(milestone.work_status);
  const [percent, setPercent] = useState(milestone.work_percent);
  const [dueDate, setDueDate] = useState(milestone.due_date || "");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(event) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/milestones/${milestone.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workStatus: status, workPercent: Number(percent), dueDate: dueDate || null }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error?.message || "Unable to update milestone.");
      setMessage("Saved"); window.location.reload();
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  return <form className="portal-form portal-milestone-admin" onSubmit={save}><label>Status<select value={status} onChange={(event)=>{setStatus(event.target.value); if(event.target.value==="completed")setPercent(100);}}>{["not_started","in_progress","completed","blocked"].map((value)=><option key={value} value={value}>{value.replaceAll("_"," ")}</option>)}</select></label><label>Progress %<input type="number" min="0" max="100" value={percent} onChange={(event)=>setPercent(event.target.value)} /></label><label>Due date<input type="date" value={dueDate} onChange={(event)=>setDueDate(event.target.value)} /></label><div className="portal-actions"><button className="portal-button portal-button--primary" disabled={busy}>{busy?"Saving…":"Save progress"}</button>{message&&<small role="status">{message}</small>}</div></form>;
}

export function TeamMemberAssignment({ projectId, members, assignedIds }) {
  const [memberId, setMemberId] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function assign(event) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/members`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({memberId}) });
      const result = await response.json();
      if(!response.ok) throw new Error(result?.error?.message || "Unable to assign member.");
      setMessage("Team member assigned."); window.location.reload();
    } catch(error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  const available = members.filter((member)=>!assignedIds.includes(member.id));
  return <form className="portal-form portal-assign-form" onSubmit={assign}><label>Assign a team member<select value={memberId} onChange={(event)=>setMemberId(event.target.value)} required><option value="">Select account</option>{available.map((member)=><option key={member.id} value={member.id}>{member.full_name || member.id}</option>)}</select></label><button className="portal-button portal-button--primary" disabled={busy || !available.length}>{busy?"Assigning…":"Assign"}</button>{message&&<small role="status">{message}</small>}{!available.length&&<small>All team members are assigned, or no team accounts exist.</small>}</form>;
}
