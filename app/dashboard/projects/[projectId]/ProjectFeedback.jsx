"use client";

import { useState } from "react";

export function ProjectCommentForm({ projectId }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); const formElement = event.currentTarget; setBusy(true); setMessage("");
    const form = new FormData(formElement);
    try {
      const response = await fetch(`/api/projects/${projectId}/comments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body: form.get("body") }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error?.message || "Unable to post your comment.");
      formElement.reset(); window.location.reload();
    } catch (error) { setMessage(error.message || "Unable to post your comment."); }
    finally { setBusy(false); }
  }
  return <form className="portal-form portal-panel-body" onSubmit={submit}><label>Leave a project comment<textarea name="body" maxLength={5000} required /></label>{message && <p className="portal-inline-error" role="status">{message}</p>}<button className="portal-button portal-button--primary" disabled={busy}>{busy ? "Posting…" : "Post comment"}</button></form>;
}

export function MilestoneFeedback({ projectId, milestoneId, workStatus, approvalStatus }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function review(status) {
    setBusy(true); setMessage("");
    const comment = document.querySelector(`[data-review="${milestoneId}"]`)?.value || "";
    try {
      const response = await fetch(`/api/projects/${projectId}/milestones/${milestoneId}/approval`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, comment }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error?.message || "Unable to submit your review.");
      window.location.reload();
    } catch (error) { setMessage(error.message || "Unable to submit your review."); setBusy(false); }
  }
  if (workStatus !== "completed") return null;
  if (approvalStatus === "approved") return <span className="portal-status portal-status--approved">Client approved</span>;
  if (!["pending", "revision_requested"].includes(approvalStatus)) return <small className="portal-field-hint">Waiting for the agency to submit this milestone for review.</small>;
  return <div className="portal-feedback"><label>Approval or revision note<textarea data-review={milestoneId} maxLength={3000} placeholder="Optional for approval; required for revisions" /></label><div className="portal-actions">{approvalStatus !== "approved" && <button className="portal-button portal-button--primary" disabled={busy} onClick={() => review("approved")}>Approve</button>}{approvalStatus !== "revision_requested" && <button className="portal-button portal-button--secondary" disabled={busy} onClick={() => review("revision_requested")}>Request revisions</button>}</div>{message && <small className="portal-inline-error">{message}</small>}</div>;
}
