"use client";

import { useState } from "react";

const statuses = ["new", "reviewing", "proposal_sent", "accepted", "declined", "archived"];
const statusLabels = {
  new: "New",
  reviewing: "In review",
  proposal_sent: "Proposal sent",
  accepted: "Accepted",
  declined: "Declined",
  archived: "Archived",
};

export default function RequestActions({ requestId, status, clientName }) {
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
  return <div className="portal-request-status">
    <div className="portal-request-status__control">
      <select
        className={`portal-request-status__select portal-request-status--${current}`}
        data-status={current}
        aria-label={`Status for ${clientName || "project request"}`}
        aria-busy={busy}
        value={current}
        disabled={busy}
        onChange={change}
      >
        {statuses.map((value) => <option key={value} value={value}>{statusLabels[value]}</option>)}
      </select>
      <span className="portal-request-status__chevron" aria-hidden="true" />
    </div>
    {busy && <small className="portal-request-status__saving" role="status">Saving status…</small>}
    {message && <small className="portal-inline-error" role="alert">{message}</small>}
  </div>;
}
