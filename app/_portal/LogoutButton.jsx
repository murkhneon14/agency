"use client";

import { useState } from "react";

export default function LogoutButton({ redirectTo = "/login", className = "portal-nav-link portal-logout", label = "Sign out", onError, role } = {}) {
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        throw new Error("Unable to sign out.");
      }
      window.location.assign(redirectTo);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "Unable to sign out. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button className={className} type="button" role={role} onClick={logout} disabled={busy}>
      {busy ? "Signing out…" : label}
    </button>
  );
}
