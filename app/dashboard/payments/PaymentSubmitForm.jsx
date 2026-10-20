"use client";

import { useState } from "react";

export default function PaymentSubmitForm({ projects }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const projectId = String(form.get("projectId"));
    const amount = Number(form.get("amount"));
    try {
      const response = await fetch(`/api/projects/${projectId}/payments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amountPaise: Math.round(amount * 100), method: form.get("method"), reference: form.get("reference"), note: form.get("note") }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error?.message || "Unable to submit this payment record.");
      setMessage("Payment details submitted for verification."); formElement.reset(); window.location.reload();
    } catch (error) { setMessage(error.message || "Unable to submit this payment record."); }
    finally { setBusy(false); }
  }
  return <form className="portal-panel-body portal-form" onSubmit={submit}>
    <div className="portal-form-grid">
      <label>Project<select name="projectId" required>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
      <label>Amount in ₹<input name="amount" type="number" min="0.01" step="0.01" required /></label>
      <label>Method<select name="method"><option value="bank_transfer">Bank transfer</option><option value="upi">UPI</option><option value="cash">Cash</option><option value="other">Other</option></select></label>
      <label>Payment reference<input name="reference" maxLength={180} placeholder="Bank reference or UPI transaction ID" /></label>
      <label>Note<input name="note" maxLength={1000} placeholder="Optional note for the team" /></label>
    </div>
    <p className="portal-field-hint">This records a payment you have already made. It does not initiate an online payment.</p>
    {message && <p className="form-message" role="status">{message}</p>}
    <button className="portal-button portal-button--primary" disabled={busy}>{busy ? "Submitting…" : "Submit for verification"}</button>
  </form>;
}
