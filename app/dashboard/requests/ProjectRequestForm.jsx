"use client";

import { useState } from "react";

export default function ProjectRequestForm({ profile, email }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setBusy(true); setMessage("");
    const form = new FormData(formElement);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch("/api/project-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error?.message || "Unable to submit the request.");
      setMessage("Your project request was submitted. The team will review it and follow up.");
      formElement.reset();
      window.location.reload();
    } catch (error) {
      setMessage(error.message || "Unable to submit the request.");
    } finally { setBusy(false); }
  }
  return <form className="portal-panel-body portal-form" onSubmit={submit}>
    <div className="portal-form-grid">
      <label>Name<input name="name" defaultValue={profile.full_name} maxLength={120} required /></label>
      <label>Email<input name="email" type="email" defaultValue={email || ""} maxLength={254} required /></label>
      <label>Company <span className="portal-field-hint">Optional</span><input name="company" maxLength={120} /></label>
      <label>Service<select name="service" defaultValue="Website Development" required>{["Website Development","E-commerce Development","Mobile Application Development","SaaS Development","UI/UX Design","AI Integration","Website Maintenance","Other"].map((item) => <option key={item}>{item}</option>)}</select></label>
      <label>Budget<select name="budget" defaultValue="not-sure" required><option value="under-50k">Under ₹50,000</option><option value="50k-2l">₹50,000 – ₹2 lakh</option><option value="2l-5l">₹2 lakh – ₹5 lakh</option><option value="5l-plus">Above ₹5 lakh</option><option value="not-sure">Not sure yet</option></select></label>
      <label>Timeline<select name="timeline" defaultValue="flexible" required><option value="asap">As soon as possible</option><option value="1-2-months">1–2 months</option><option value="3-6-months">3–6 months</option><option value="flexible">Flexible</option></select></label>
      <label className="span-2">Project description<textarea name="description" minLength={1} maxLength={5000} placeholder="What would you like us to build? Include key features and goals." required /></label>
    </div>
    {message && <p className="form-message" role="status">{message}</p>}
    <button className="portal-button portal-button--primary" disabled={busy}>{busy ? "Submitting…" : "Submit request"}</button>
  </form>;
}
