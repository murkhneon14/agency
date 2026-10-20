"use client";

import { useState } from "react";

export default function ProjectUpdateForm({ projectId }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); const formElement = event.currentTarget; const form = new FormData(formElement); setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/updates`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: form.get("title"), body: form.get("body"), visibility: form.get("visibility") }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error?.message || "Unable to save update.");
      setMessage("Update saved."); formElement.reset(); window.location.reload();
    } catch (error) { setMessage(error.message || "Unable to save update."); }
    finally { setBusy(false); }
  }
  return <form className="portal-panel-body portal-form" onSubmit={submit}><div className="portal-form-grid"><label>Update title<input name="title" maxLength={160} required /></label><label>Visibility<select name="visibility"><option value="client">Client visible</option><option value="internal">Internal note</option></select></label><label className="span-2">Message<textarea name="body" maxLength={5000} required /></label></div>{message&&<p className="form-message" role="status">{message}</p>}<button className="portal-button portal-button--primary" disabled={busy}>{busy?"Saving…":"Post update"}</button></form>;
}
