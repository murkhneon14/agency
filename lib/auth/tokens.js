import crypto from "node:crypto";

export const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60; // 7 days

export function getSecret() {
  const secret = process.env.AUTH_SECRET || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error("AUTH_SECRET or SUPABASE_SECRET_KEY must be configured for session security.");
  }
  return secret;
}

/**
 * Creates a signed session token.
 * Token format: <base64url-payload>.<base64url-hmac>
 */
export function createSessionToken(payload, secret = getSecret()) {
  const data = {
    ...payload,
    exp: Date.now() + SESSION_DURATION_SECONDS * 1000,
  };
  const dataB64 = Buffer.from(JSON.stringify(data)).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(dataB64).digest("base64url");
  return `${dataB64}.${signature}`;
}

/**
 * Verifies a signed session token.
 * Returns decoded payload if valid and unexpired, otherwise null.
 */
export function verifySessionToken(token, secret = getSecret()) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [dataB64, signature] = parts;

  try {
    const expectedSig = crypto.createHmac("sha256", secret).update(dataB64).digest("base64url");
    const sigBuf = Buffer.from(signature);
    const expectedSigBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expectedSigBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expectedSigBuf)) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(dataB64, "base64url").toString("utf-8"));
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
