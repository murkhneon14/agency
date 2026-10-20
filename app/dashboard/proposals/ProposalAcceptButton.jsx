"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProposalAcceptButton({ proposalId }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  async function accept() {
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/proposals/${proposalId}/accept`, { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error?.message || "Unable to accept proposal.");
      router.push(`/dashboard/projects/${result.projectId}`);
    } catch (error) { setMessage(error.message); setBusy(false); }
  }
  return <div><button className="portal-button portal-button--primary" disabled={busy} onClick={accept}>{busy ? "Accepting…" : "Accept proposal"}</button>{message && <small className="portal-inline-error">{message}</small>}</div>;
}
