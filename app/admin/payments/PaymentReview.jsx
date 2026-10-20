"use client";

import { useState } from "react";

export default function PaymentReview({ paymentId, status }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function review(nextStatus) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus, adminNote: "" }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error?.message || "Unable to update the payment.");
      window.location.reload();
    } catch (error) { setMessage(error.message || "Unable to update the payment."); }
    finally { setBusy(false); }
  }
  return status === "pending" ? <div><div className="portal-actions"><button className="portal-button portal-button--primary" type="button" disabled={busy} onClick={() => review("verified")}>Verify</button><button className="portal-button portal-button--secondary" type="button" disabled={busy} onClick={() => review("rejected")}>Reject</button></div>{message && <small className="portal-inline-error">{message}</small>}</div> : <span className={`portal-status portal-status--${status}`}>{status}</span>;
}
