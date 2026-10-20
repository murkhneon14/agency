"use client";

import { useState } from "react";

export default function ProfileForm({ profile }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); const formElement = event.currentTarget; setBusy(true); setMessage("");
    const form = new FormData(formElement);
    try {
      const response = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ full_name: form.get("fullName"), company: form.get("company"), phone: form.get("phone") }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error?.message || "Unable to update profile.");
      setMessage("Profile updated."); window.location.reload();
    } catch (error) { setMessage(error.message || "Unable to update profile."); }
    finally { setBusy(false); }
  }
  return <form className="portal-panel-body portal-form" onSubmit={submit}><div className="portal-form-grid"><label>Full name<input name="fullName" defaultValue={profile.full_name} maxLength={120} required /></label><label>Company<input name="company" defaultValue={profile.company || ""} maxLength={120} /></label><label>Phone<input name="phone" defaultValue={profile.phone || ""} maxLength={40} /></label><label>Email<input value={profile.email} disabled /></label><label>Account role<input value={profile.role} disabled /></label></div>{message && <p className="form-message" role="status">{message}</p>}<button className="portal-button portal-button--primary" disabled={busy}>{busy ? "Saving…" : "Save profile"}</button></form>;
}
