"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import LogoutButton from "../../_portal/LogoutButton.jsx";

const workspaceByRole = {
  ADMIN: { href: "/admin", label: "Agency workspace" },
  TEAM_MEMBER: { href: "/team", label: "Team workspace" },
  CLIENT: { href: "/dashboard", label: "Client portal" },
};

export default function AccountMenu({ account }) {
  const [open, setOpen] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const panelId = useId();
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const workspace = account ? workspaceByRole[account.role] : null;

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="account-menu" ref={menuRef}>
      <button
        ref={triggerRef}
        type="button"
        className="menu-dots account-menu-trigger"
        aria-label={account ? "Open account menu" : "Open sign-in menu"}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          setOpen((isOpen) => !isOpen);
          setLogoutError("");
        }}
      >
        <span aria-hidden="true"><i /><i /><i /></span>
      </button>

      {open && (
        <div className="account-menu-panel" id={panelId} aria-label="Account options">
          {account ? (
            <>
              <div className="account-menu-heading">
                <strong>{account.fullName || "Signed in"}</strong>
                {account.email && <span>{account.email}</span>}
              </div>
              {workspace && <Link className="account-menu-action" href={workspace.href}>{workspace.label}</Link>}
              <LogoutButton redirectTo="/" className="account-menu-action account-menu-action--button" label="Sign out" onError={setLogoutError} />
              {logoutError && <p className="account-menu-error" role="alert">{logoutError}</p>}
            </>
          ) : (
            <>
              <Link className="account-menu-action" href="/login">Client sign in</Link>
              <Link className="account-menu-action" href="/signup">Create an account</Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
