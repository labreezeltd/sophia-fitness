import { COMPANY } from "@shared/company";

/* ============================================================
   Email sending.

   If RESEND_API_KEY is set (see .env.example), real email is sent
   via Resend from info@axiom-tech.co.uk. If not, sends are
   "simulated" — the app behaves identically (messages mark as
   sent) so you can demo end-to-end with zero accounts, and it
   becomes real the instant a key is present. No code changes.
   ============================================================ */

const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM || `${COMPANY.product} <${COMPANY.email}>`;

export function emailProvider() {
  return process.env.EMAIL_PROVIDER || "resend";
}

export function emailConfigured(): boolean {
  return Boolean(RESEND_KEY);
}

export interface SendResult {
  sent: boolean;
  simulated: boolean;
  error?: string;
}

export async function sendEmail(opts: {
  to?: string | null;
  subject: string;
  body: string;
}): Promise<SendResult> {
  // No provider configured → simulate a successful send.
  if (!RESEND_KEY) return { sent: true, simulated: true };

  // Real send needs a destination address.
  if (!opts.to) return { sent: false, simulated: false, error: "no recipient email" };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [opts.to],
        subject: opts.subject,
        text: opts.body,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      return { sent: false, simulated: false, error: `${res.status}: ${text.slice(0, 200)}` };
    }
    return { sent: true, simulated: false };
  } catch (e: any) {
    return { sent: false, simulated: false, error: e?.message ?? "send failed" };
  }
}
