"use client";

import { useState } from "react";

export default function InvoiceCreateForm({ projects }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id || "");
  async function submit(event) {
    event.preventDefault(); const form = new FormData(event.currentTarget); setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/admin/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId, dueDate: String(form.get("dueDate") || "") || null, milestoneIds: [] }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error?.message || "Unable to create invoice.");
      window.location.assign(result.href);
    } catch (error) { setMessage(error.message || "Unable to create invoice."); setBusy(false); }
  }
  return <form className="portal-panel-body portal-form" onSubmit={submit}><div className="portal-form-grid"><label>Project<select value={projectId} onChange={(event)=>setProjectId(event.target.value)} required>{projects.map((project)=><option key={project.id} value={project.id}>{project.name}</option>)}</select></label><label>Due date<input type="date" name="dueDate" /></label></div>{!projects.length&&<p className="portal-field-hint">Create a project before issuing an invoice.</p>}{message&&<p className="portal-inline-error" role="status">{message}</p>}<button className="portal-button portal-button--primary" disabled={busy||!projects.length}>{busy?"Creating…":"Create invoice for unbilled milestones"}</button></form>;
}
