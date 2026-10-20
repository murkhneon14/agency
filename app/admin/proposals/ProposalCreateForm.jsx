"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const empty = { title: "", description: "", amount: "", dueDate: "" };
export default function ProposalCreateForm({ requestId, suggestedTitle }) {
  const [milestones, setMilestones] = useState([{ ...empty }]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  function patch(index, key, value) { setMilestones((items) => items.map((item, itemIndex) => index === itemIndex ? { ...item, [key]: value } : item)); }
  async function submit(event) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = new FormData(event.currentTarget);
    const payload = {
      requestId,
      title: String(form.get("title")),
      description: String(form.get("description") || ""),
      expiresAt: String(form.get("expiresAt") || "") || null,
      milestones: milestones.map((item) => ({ title: item.title, description: item.description, pricePaise: Math.round(Number(item.amount) * 100), dueDate: item.dueDate || null })),
    };
    try {
      const response = await fetch("/api/admin/proposals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error?.message || "Unable to send proposal.");
      setMessage("Proposal sent to the client."); router.push("/admin/requests"); router.refresh();
    } catch (error) { setMessage(error.message || "Unable to send proposal."); setBusy(false); }
  }
  return <form className="portal-panel-body portal-form" onSubmit={submit}>
    <div className="portal-form-grid"><label>Proposal title<input name="title" defaultValue={suggestedTitle} maxLength={160} required /></label><label>Expires on<input type="date" name="expiresAt" /></label><label className="span-2">Scope and notes<textarea name="description" maxLength={5000} /></label></div>
    <div className="portal-section-label">Milestone plan</div>
    {milestones.map((item,index) => <div className="portal-panel-body portal-milestone-editor" key={index}><div className="portal-form-grid"><label>Title<input value={item.title} onChange={(event) => patch(index,"title",event.target.value)} maxLength={160} required /></label><label>Price (₹)<input value={item.amount} onChange={(event) => patch(index,"amount",event.target.value)} type="number" min="0" step="0.01" required /></label><label>Description<input value={item.description} onChange={(event) => patch(index,"description",event.target.value)} maxLength={2000} /></label><label>Due date<input value={item.dueDate} onChange={(event) => patch(index,"dueDate",event.target.value)} type="date" /></label></div>{milestones.length>1 && <button type="button" className="portal-button portal-button--secondary" onClick={() => setMilestones((items)=>items.filter((_,itemIndex)=>itemIndex!==index))}>Remove milestone</button>}</div>)}
    <div className="portal-actions"><button type="button" className="portal-button portal-button--secondary" onClick={() => setMilestones((items)=>[...items,{...empty}])}>Add milestone</button></div>
    <p className="portal-field-hint">Total: {new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR"}).format(milestones.reduce((sum,item)=>sum+(Number(item.amount)||0),0))}</p>
    {message && <p className="form-message" role="status">{message}</p>}
    <button className="portal-button portal-button--primary" disabled={busy}>{busy ? "Sending…" : "Send proposal"}</button>
  </form>;
}
