import "server-only";

const BREVO_EMAIL_URL = "https://api.brevo.com/v3/smtp/email";

export async function sendBrevoEmail({ to, subject, textContent, htmlContent }) {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim();
  const safeSubject = String(subject || "Notification").replace(/[\r\n]+/g, " ").trim().slice(0, 255);
  const recipients = (Array.isArray(to) ? to : [to]).filter((recipient) => recipient?.email?.trim());

  if (!recipients.length) return { sent: 0, skipped: "no_recipients" };
  if (!apiKey || !senderEmail) {
    console.warn("Brevo email skipped: BREVO_API_KEY and BREVO_SENDER_EMAIL must be configured.");
    return { sent: 0, skipped: "not_configured" };
  }

  const sender = {
    email: senderEmail,
    ...(process.env.BREVO_SENDER_NAME?.trim() ? { name: process.env.BREVO_SENDER_NAME.trim() } : {}),
  };

  const results = await Promise.all(recipients.map(async (recipient) => {
    try {
      const response = await fetch(BREVO_EMAIL_URL, {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-key": apiKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender,
          to: [{ email: recipient.email.trim(), ...(recipient.name ? { name: recipient.name } : {}) }],
          subject: safeSubject,
          textContent,
          htmlContent,
        }),
        signal: AbortSignal.timeout(8_000),
      });

      if (!response.ok) {
        console.error(`Brevo email failed with HTTP ${response.status}.`);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Brevo email request failed.", error instanceof Error ? error.message : "Unknown error");
      return false;
    }
  }));

  return { sent: results.filter(Boolean).length, failed: results.filter((sent) => !sent).length };
}
