"use client";

import { useState } from "react";

const statuses = ["new", "reviewing", "proposal_sent", "accepted", "declined", "archived"];
export default function RequestActions({ requestId, status }) {
  const [current, setCurrent] = useState(status);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function change(event) {
    const next = event.target.value;
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/requests/${requestId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error?.message || "Update failed.");
      setCurrent(next);
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  return <div><select aria-label="Request status" value={current} disabled={busy} onChange={change}>{statuses.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select>{message && <small className="portal-inline-error">{message}</small>}</div>;
}
