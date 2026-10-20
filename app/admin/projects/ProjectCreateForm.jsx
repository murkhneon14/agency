"use client";

import { useState } from "react";

const emptyMilestone = { title: "", description: "", amount: "", dueDate: "" };

export default function ProjectCreateForm({ clients }) {
  const [milestones, setMilestones] = useState([{ ...emptyMilestone }]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  function patch(index, key, value) { setMilestones((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item)); }
  async function submit(event) {
    event.preventDefault(); setBusy(true); setMessage(""); setIsError(false);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const rawAmount = Number(form.get("totalPrice"));
    const payload = {
      clientId: String(form.get("clientId")), requestId: String(form.get("requestId") || "") || null,
      name: String(form.get("name")), description: String(form.get("description") || ""),
      totalPricePaise: Math.round(rawAmount * 100), startDate: String(form.get("startDate") || "") || null,
      expectedCompletionDate: String(form.get("expectedCompletionDate") || "") || null,
      milestones: milestones.map((item) => ({ title: item.title, description: item.description, pricePaise: Math.round(Number(item.amount) * 100), dueDate: item.dueDate || null })),
    };
    try {
      const response = await fetch("/api/admin/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error?.message || "Unable to create the project.");
      setMessage(`Project created (${result.projectId.slice(0, 8)}).`); formElement.reset(); setMilestones([{ ...emptyMilestone }]); window.location.reload();
    } catch (error) { setIsError(true); setMessage(error.message || "Unable to create the project."); }
    finally { setBusy(false); }
  }
  return <form className="portal-panel-body portal-form" onSubmit={submit}>
    <div className="portal-form-grid">
      <label>Client<select name="clientId" required defaultValue=""><option value="" disabled>Select a client</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.full_name || client.id}</option>)}</select></label>
      <label>Project name<input name="name" maxLength={160} required /></label>
      <label className="span-2">Description<textarea name="description" maxLength={5000} /></label>
      <label>Total project price (₹)<input name="totalPrice" type="number" min="0" step="0.01" required /></label>
      <label>Related request ID <span className="portal-field-hint">Optional UUID</span><input name="requestId" placeholder="Select from Requests first" /></label>
      <label>Start date<input name="startDate" type="date" /></label>
      <label>Expected completion<input name="expectedCompletionDate" type="date" /></label>
    </div>
    <div className="portal-section-label">Project milestones</div>
    {milestones.map((item, index) => <div className="portal-panel-body portal-milestone-editor" key={index}><div className="portal-form-grid"><label>Milestone title<input value={item.title} onChange={(event) => patch(index, "title", event.target.value)} maxLength={160} required /></label><label>Milestone price (₹)<input value={item.amount} onChange={(event) => patch(index, "amount", event.target.value)} type="number" min="0" step="0.01" required /></label><label>Description<input value={item.description} onChange={(event) => patch(index, "description", event.target.value)} maxLength={2000} /></label><label>Due date<input value={item.dueDate} onChange={(event) => patch(index, "dueDate", event.target.value)} type="date" /></label></div>{milestones.length > 1 && <button type="button" className="portal-button portal-button--secondary" onClick={() => setMilestones((current) => current.filter((_, itemIndex) => index !== itemIndex))}>Remove milestone</button>}</div>)}
    <div className="portal-actions"><button type="button" className="portal-button portal-button--secondary" onClick={() => setMilestones((current) => [...current, { ...emptyMilestone }])}>Add milestone</button></div>
    <p className="portal-field-hint">Milestone amounts must add up to the total project price.</p>
    {message && <p className={isError ? "portal-inline-error" : "form-message"} role="status">{message}</p>}
    <button className="portal-button portal-button--primary" disabled={busy || clients.length === 0}>{busy ? "Creating…" : "Create project"}</button>
    {clients.length === 0 && <p className="portal-field-hint">No client profiles are available yet.</p>}
  </form>;
}
