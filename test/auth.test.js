import test from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "../lib/auth/password.js";
import { createSessionToken, verifySessionToken } from "../lib/auth/tokens.js";
import { loginSchema, signupSchema, resetPasswordSchema } from "../lib/validations/schemas.js";

// Ensure a test secret is available for session tests
process.env.AUTH_SECRET = "test-super-secret-auth-key-at-least-32-chars-long";

test("hashPassword hashes and verifyPassword checks correctly", async () => {
  const password = "mySecurePassword123!";
  const hash = await hashPassword(password);

  assert.notEqual(hash, password);
  assert.equal(await verifyPassword(password, hash), true);
  assert.equal(await verifyPassword("wrongPassword", hash), false);
  assert.equal(await verifyPassword("", hash), false);
  assert.equal(await verifyPassword(password, ""), false);
});

test("createSessionToken generates verifiable tokens and detects tampering", () => {
  const user = { userId: "uuid-1234", email: "user@example.com", role: "CLIENT" };
  const token = createSessionToken(user);

  assert.ok(token.includes("."));
  const verified = verifySessionToken(token);
  assert.ok(verified);
  assert.equal(verified.userId, user.userId);
  assert.equal(verified.email, user.email);
  assert.equal(verified.role, user.role);

  // Tampered payload
  const [data, sig] = token.split(".");
  const tamperedData = Buffer.from(JSON.stringify({ ...user, role: "ADMIN", exp: Date.now() + 10000 })).toString("base64url");
  assert.equal(verifySessionToken(`${tamperedData}.${sig}`), null);

  // Tampered signature
  assert.equal(verifySessionToken(`${data}.invalid-signature`), null);
});

test("auth schemas validate fields properly", () => {
  // Login
  assert.equal(loginSchema.safeParse({ email: "test@example.com", password: "password123" }).success, true);
  assert.equal(loginSchema.safeParse({ email: "invalid-email", password: "password123" }).success, false);
  assert.equal(loginSchema.safeParse({ email: "test@example.com", password: "short" }).success, false);

  // Signup
  assert.equal(signupSchema.safeParse({ fullName: "Jane Doe", email: "jane@example.com", password: "password123" }).success, true);
  assert.equal(signupSchema.safeParse({ fullName: "", email: "jane@example.com", password: "password123" }).success, false);

  // Reset password
  assert.equal(resetPasswordSchema.safeParse({ token: "abc-token", password: "newPassword123" }).success, true);
  assert.equal(resetPasswordSchema.safeParse({ token: "", password: "newPassword123" }).success, false);
});
