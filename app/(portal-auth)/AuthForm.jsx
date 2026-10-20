"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const copy = {
  login: { title: "Welcome back", description: "Sign in to view your projects and updates.", button: "Sign in" },
  signup: { title: "Create your account", description: "Use your client account to submit a request and follow your project.", button: "Create account" },
  forgot: { title: "Reset your password", description: "We’ll email you a secure password reset link.", button: "Send reset link" },
  reset: { title: "Choose a new password", description: "Set a new password for your account.", button: "Save password" },
};

export default function AuthForm({ mode }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const isSignup = mode === "signup";
  const isForgot = mode === "forgot";
  const isReset = mode === "reset";

  async function handleSubmit(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setBusy(true);
    setMessage("");

    try {
      const form = new FormData(formElement);
      const email = String(form.get("email") || "").trim();
      const password = String(form.get("password") || "");

      if (isSignup) {
        const fullName = String(form.get("fullName") || "").trim();
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName, email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "Registration failed.");
        window.location.assign("/auth/redirect");
      } else if (isForgot) {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "Unable to request password reset.");
        setMessage(data.message || "If an account exists for that address, a reset link is on its way.");
      } else if (isReset) {
        const token = new URLSearchParams(window.location.search).get("token") || "";
        if (!token) {
          throw new Error("Missing reset token. Please request a new password reset link.");
        }
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "Failed to reset password.");
        setMessage("Password updated successfully. Redirecting to sign in…");
        window.setTimeout(() => router.replace("/login"), 900);
      } else {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "Invalid email or password.");
        window.location.assign("/auth/redirect");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to complete this request.");
    } finally {
      setBusy(false);
    }
  }

  const content = copy[mode];
  return (
    <section className="auth-card" aria-labelledby="auth-heading">
      <a className="portal-brand" href="/" aria-label="8bitbrains home">
        <span className="portal-brand-mark">8</span>
        <span>8bitbrains</span>
      </a>
      <h1 id="auth-heading">{content.title}</h1>
      <p className="auth-description">{content.description}</p>
      <form className="portal-form" onSubmit={handleSubmit}>
        {isSignup && (
          <label>
            Full name
            <input name="fullName" autoComplete="name" maxLength={120} required />
          </label>
        )}
        {!isReset && (
          <label>
            Email
            <input name="email" type="email" autoComplete="email" maxLength={254} required />
          </label>
        )}
        {!isForgot && (
          <label>
            Password
            <input
              name="password"
              type="password"
              minLength={8}
              autoComplete={isSignup ? "new-password" : "current-password"}
              required
            />
          </label>
        )}
        {message && <p className="form-message" role="status">{message}</p>}
        <button className="portal-button portal-button--primary" type="submit" disabled={busy}>
          {busy ? "Please wait…" : content.button}
        </button>
      </form>
      <nav className="auth-links" aria-label="Account links">
        {mode === "login" && (
          <>
            <a href="/forgot-password">Forgot password?</a>
            <span>
              New here? <a href="/signup">Create an account</a>
            </span>
          </>
        )}
        {mode === "signup" && <span>Already have an account? <a href="/login">Sign in</a></span>}
        {mode === "forgot" && <a href="/login">Back to sign in</a>}
        {mode === "reset" && <a href="/login">Back to sign in</a>}
      </nav>
    </section>
  );
}
